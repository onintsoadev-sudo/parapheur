const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter = null;

if (process.env.MAIL_HOST && process.env.MAIL_USERNAME) {
  transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    secure: false,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });
}

async function sendMail({ to, subject, text, html }) {
  if (!transporter) {
    console.log('[MAIL] (simulation) À:', to, '| Sujet:', subject, '| Contenu:', text);
    return { simulated: true };
  }

  return transporter.sendMail({
    from: `"${process.env.MAIL_FROM_NAME || 'e-parapheur'}" <${process.env.MAIL_FROM_ADDRESS}>`,
    to,
    subject,
    text,
    html,
  });
}

module.exports = { sendMail };
