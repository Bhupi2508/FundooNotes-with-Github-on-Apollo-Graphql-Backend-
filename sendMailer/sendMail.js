/**
 * Sends the verification / reset / GitHub-login links by email (Gmail via nodemailer).
 * Credentials come from EMAIL and PASSWORD (use a Gmail app password) in .env.
 */
const nodemailer = require('nodemailer');
const logger = require('../services/logger');

/**
 * @param {String} url   link to put in the mail body
 * @param {String} email recipient
 * @returns {Promise<{message: String, sent: Boolean}>}
 */
exports.sendEmailFunction = async (url, email) => {
    if (!email) return { message: 'No recipient email address', sent: false };
    if (!process.env.EMAIL || !process.env.PASSWORD) {
        logger.error('EMAIL / PASSWORD are not configured; mail not sent');
        return { message: 'Mail service is not configured', sent: false };
    }
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL, pass: process.env.PASSWORD },
    });
    try {
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: 'fundoo verification link',
            text: 'Please follow the link below:\n\n' + url,
        });
        return { message: 'Message sent successfully', sent: true };
    } catch (err) {
        logger.error('Error sending mail: ' + err.message);
        return { message: 'Error sending mail', sent: false };
    }
};
