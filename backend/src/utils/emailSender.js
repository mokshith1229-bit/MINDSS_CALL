const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  if (!process.env.SMTP_HOST) {
    console.warn('⚠️ SMTP_HOST is not configured in .env. Simulating email delivery...');
    console.log('--- MOCK EMAIL ---');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Content: \n${options.html || options.message}`);
    console.log('------------------');
    return { messageId: 'mock-id-12345', simulated: true };
  }

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
  const info = await transporter.sendMail(mailOptions);
  return info;
};

module.exports = sendEmail;
