import 'dotenv/config';
import nodemailer from 'nodemailer';

export default async function sendEmail(subject, user, text, attachments = []) {
    try {
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.email, //  email
          pass: process.env.emailpass  //  senha
        }
      });
  
      let mailOptions = {
        from: process.env.email,
        to: `${user}`,
        subject: `${subject}`,
        text: `${text}`,
        attachments: attachments // Adiciona anexos aqui
      };
  
      let info = await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Erro ao enviar o email: ', error);
    }
}
