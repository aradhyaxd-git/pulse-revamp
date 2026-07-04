import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const emailService = {
  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      const fromEmail = process.env.EMAIL_FROM || "Muse AI <museai.orders@gmail.com>";

      const info = await transporter.sendMail({
        from: fromEmail,
        to,
        subject,
        html,
      });

      console.log(`[Email] Message sent to ${to}: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('[Email] Failed to send email:', error);
      return false;
    }
  },
};
