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

export function sendMail(to, subject, html) {
  const mailOptions = {
    from: 'SLICK <slick.routing@gmail.com>',
    to,
    subject,
    html: 
    `
    ${html} 
    </br>
    <p>Best regards,</p> 
    <strong>Slick Team</strong>
    <center>
      <img style="display: inline-block; height: 256px; width: auto;" src="https://svgshare.com/i/15N6.svg" alt="Slick">
      </img>
    </center>
    `
  };

  return transporter.sendMail(mailOptions); // Corrected here
}