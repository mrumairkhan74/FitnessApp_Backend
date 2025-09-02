const { MemberModel } = require('../models/Discriminators');
const generateToken = require('../utils/GenerateToken');
const hashedPassword = require('../utils/HashedPassword');
const bcrypt = require('bcryptjs');
const { uploadToCloudinary } = require('../utils/CloudinaryUpload');

const {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
} = require('../middleware/error/httpErrors');

/**
 * Create new member
 */
const createMember = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      gender,
      username,
      city,
      street,
      zipCode,
      dateOfBirth,
      about,
      memberNumber
    } = req.body;

    // check for duplicate email
    const checkEmail = await MemberModel.findOne({ email });
    if (checkEmail) throw new ConflictError('Email already exists');

    if (!req.file) throw new NotFoundError('Profile image not uploaded');

    // Upload to cloudinary
    const cloudinaryResult = await uploadToCloudinary(req.file.buffer);

    if (!password || password.length < 8)
      throw new BadRequestError(
        'Invalid password: must be at least 8 characters'
      );

    const securePassword = await hashedPassword(password);

    const member = await MemberModel.create({
      firstName,
      lastName,
      username,
      gender,
      phone,
      city,
      street,
      zipCode,
      dateOfBirth,
      about,
      email,
      memberNumber,
      password: securePassword,
      img: {
        url: cloudinaryResult.secure_url,
        public_id: cloudinaryResult.public_id,
      },
    });

    const { AccessToken, RefreshToken } = generateToken({
      firstName: member.firstName,
      lastName: member.lastName,
      username: member.username,
      id: member._id,
      email: member.email,
      role: member.role,
      img: member.img?.url,
      gender: member.gender,
    });

    member.refreshToken = RefreshToken;
    await member.save();

    res.cookie('token', AccessToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
    });
    res.cookie('refreshToken', RefreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
    });

    res.status(201).json({
      message: 'Member created successfully',
      member: {
        id: member._id,
        firstName: member.firstName,
        lastName: member.lastName,
        username: member.username,
        email: member.email,
        role: member.role,
        img: member.img?.url,
        gender: member.gender,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Login member
 */
const loginMember = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const member = await MemberModel.findOne({ email }).select('+password');
    if (!member) throw new NotFoundError('Invalid email');

    const isMatch = await bcrypt.compare(password, member.password);
    if (!isMatch) throw new UnauthorizedError('Invalid password');

    const { AccessToken, RefreshToken } = generateToken({
      firstName: member.firstName,
      lastName: member.lastName,
      username: member.username,
      id: member._id,
      email: member.email,
      role: member.role,
      img: member.img?.url,
      gender: member.gender,
    });

    member.refreshToken = RefreshToken;
    await member.save();

    res.cookie('token', AccessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
    });
    res.cookie('refreshToken', RefreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
    });

    res.status(200).json({
      message: 'Logged in successfully',
      token: AccessToken,
      member: {
        id: member._id,
        firstName: member.firstName,
        lastName: member.lastName,
        username: member.username,
        email: member.email,
        role: member.role,
        img: member.img?.url,
        gender: member.gender,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update member
 */
const updateMemberById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let updateMember = { ...req.body };

    if (!req.file) throw new NotFoundError("Image Not Uploaded");

    // Upload to Cloudinary using stream
    const cloudinaryResult = await uploadToCloudinary(req.file.buffer);

    // ✅ Save new image URL + public_id into update object
    updateMember.img = {
      url: cloudinaryResult.secure_url,
      public_id: cloudinaryResult.public_id,
    };

    // Update member in MongoDB
    const member = await MemberModel.findByIdAndUpdate(id, updateMember, { new: true });
    if (!member) throw new NotFoundError("member not found");

    res.status(200).json({
      message: "Successfully Updated",
      member: {
        id: member._id,
        firstName: member.firstName,
        lastName: member.lastName,
        username: member.username,
        email: member.email,
        studioName: member.studioName,
        role: member.role,
        img: member.img?.url, // ✅ now points to Cloudinary URL
        memberRole: member.memberRole,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete member
 */
const deleteMemberById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const member = await MemberModel.findByIdAndDelete(id);
    if (!member) throw new NotFoundError('Member not found');

    res.status(200).json({ message: 'Member deleted successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * Get logged-in member profile
 */
const getMemberById = async (req, res, next) => {
  try {
    const memberId = req.user?.id;

    const member = await MemberModel.findById(memberId)
      .populate({
        path: 'appointments',
        select: 'appointmentType date timeSlot bookingType relation',
        populate: {
          path: 'relation',
          select: 'relationType category',
        },
      }).populate('bookTrials', 'trialType trialDate trialTime ')
      .select('-password');
    if (!member) throw new NotFoundError('Member not found');

    res.status(200).json({ member });
  } catch (err) {
    next(err);
  }
};


const getMembers = async (req, res, next) => {
  try {
    const member = await MemberModel.find();
    if (!member) throw new NotFoundError('no member Available');
    return res.status(200).json({
      status: true,
      member
    })
  }
  catch (error) {
    next(error)
  }
}

module.exports = {
  createMember,
  loginMember,
  updateMemberById,
  deleteMemberById,
  getMemberById,
  getMembers
};
