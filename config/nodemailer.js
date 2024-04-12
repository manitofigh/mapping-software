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

export function sendEmail(to, subject, html) {
  const mailOptions = {
    from: 'SLICK <no-reply@slick.routing@gmail.com>',
    to,
    subject,
    html
  };

  return transporter.sendMail(mailOptions);
}