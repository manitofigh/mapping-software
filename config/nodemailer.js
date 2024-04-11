import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD
  }
});

export function sendEmail(to, subject, text) {
  const mailOptions = {
    from: process.env.ADMIN_EMAIL,
    to,
    subject,
    text
  };

  return transporter.sendMail(mailOptions);
}