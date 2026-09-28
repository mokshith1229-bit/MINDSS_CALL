const nodemailer = require('nodemailer');
const EmailLog = require('../models/EmailLog.model');
const { sendGraphEmail } = require('../services/microsoftGraph.service');

const sendEmail = async (options) => {
  const emailProvider = (process.env.EMAIL_PROVIDER || 'smtp').toLowerCase();
  let info = null;
  let errorMsg = null;

  try {
    if (emailProvider === 'graph') {
      // -----------------------------
      // Microsoft Graph Email Routing
      // -----------------------------
      info = await sendGraphEmail(options);
    } else {
      // -----------------------------
      // Standard SMTP Email Routing
      // -----------------------------
      let isMock = false;
      if (!process.env.SMTP_HOST) {
        console.warn('⚠️ SMTP_HOST is not configured in .env. Simulating email delivery...');
        console.log('--- MOCK EMAIL ---');
        console.log(`To: ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Content: \n${options.html || options.message}`);
        console.log('------------------');
        isMock = true;
      }

      if (isMock) {
        info = { messageId: 'mock-id-12345', simulated: true };
      } else {
        // Create a transporter
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        // Define the email options
        const mailOptions = {
          from: `"MINDScall System" <${process.env.SMTP_USER}>`,
          to: options.email,
          subject: options.subject,
          text: options.message,
          html: options.html, // Optional HTML version
        };

        // Actually send the email
        info = await transporter.sendMail(mailOptions);
      }
    }
  } catch (err) {
    errorMsg = err.message;
    console.warn(`⚠️ Email send failed (${emailProvider}): ${errorMsg}`);
    
    // Fall back to mock email in development mode
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Simulating email delivery in development mode...');
      console.log('--- MOCK EMAIL (FALLBACK) ---');
      console.log(`To: ${options.email}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Content: \n${options.html || options.message}`);
      console.log('------------------');
      info = { messageId: 'mock-id-fallback', simulated: true, providerError: errorMsg };
      errorMsg = null;
    }
  }

  // Log the email attempt in the database
  try {
    await EmailLog.create({
      subject: options.subject,
      recipients: Array.isArray(options.email) ? options.email : options.email.split(',').map(e => e.trim()),
      status: errorMsg ? 'FAILED' : 'SUCCESS',
      error: errorMsg || (info?.providerError ? `${emailProvider} Failed: ${info.providerError}` : null),
      sentAt: new Date()
    });
  } catch (logErr) {
    console.error('Failed to log email to DB:', logErr);
  }

  if (errorMsg) {
    throw new Error(`Email could not be sent: ${errorMsg}`);
  }

  return info;
};

module.exports = sendEmail;
