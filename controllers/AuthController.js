const crypto = require('crypto');
const bcrypt = require('bcryptjs')
const { NotFoundError, BadRequestError } = require('../middleware/error/httpErrors');
const UserModel = require('../models/UserModel');
const sendEmail = require('../utils/sendEmail');
const hashedPassword = require('../utils/HashedPassword')
const { MemberModel } = require('../models/Discriminators')
const forgetPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await UserModel.findOne({ email });
        if (!user) throw new NotFoundError("Invalid email");

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000
        await user.save();

        const resetUrl = `${req.protocol}://${req.get("host")}/api/auth/resetPassword/${resetToken}`;

        const message = `You required a password Reset, Click here to reset: \n\n ${resetUrl}`;

        await sendEmail({
            to: user.email,
            subject: "Password Rest Request",
            text: message,
        })
        return res.status(200).json({ message: 'Password Reset Link send to email successfully' })
    }
    catch (error) {
        next(error)
    }
}

const resetPassword = async (req, res, next) => {
    try {
        const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest('hex');
        const user = await UserModel.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });
        if (!user) throw new BadRequestError("Invalid or Expire Token")
        user.password = await hashedPassword(req.body.password);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();
        return res.status(200).json({ message: "Password REset Successfully" })
    }
    catch (error) {
        next(error)
    }
}

const requestEmailChange = async (req, res, next) => {
    try {
        const memberId = req.user?.id;
        const { newEmail } = req.body;

        if (!newEmail) throw new BadRequestError('New email is required');

        const member = await MemberModel.findById(memberId);
        if (!member) throw new NotFoundError('Member not found');

        // Save as pending email until verified
        member.pendingEmail = newEmail;
        await member.save();

        res.status(200).json({ message: 'Email change requested. Please verify to complete.' });
    } catch (err) {
        next(err);
    }
};

const changePassword = async (req, res, next) => {
    try {
        const userId = req.user?.id;   // from token
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            throw new BadRequestError('Old and new passwords are required');
        }

        const user = await UserModel.findById(userId);
        if (!user) throw new NotFoundError('User not found');

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) throw new BadRequestError('Old password is incorrect');

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        next(error);
    }
}
module.exports = { resetPassword, forgetPassword, requestEmailChange, changePassword }