const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});
/**
 * Sends an email using nodemailer.
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Email body text
 * @param {string} html - Email body text
 */
const sendEmail = async (to, subject, text, html = null) => {
    try {
        await transporter.sendMail({
            from: `"FitnessApp" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html: html || text,

        });
    } catch (error) {
        console.log('❌ Email Error:', error.message)
        throw new Error("Email Cloud not be sent")
    }
}


module.exports = sendEmail