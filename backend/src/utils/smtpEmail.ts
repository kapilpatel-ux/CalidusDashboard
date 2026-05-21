import nodemailer from "nodemailer";
import { env } from "../config/env.js";

type EmailContent = {
  subject: string;
  text: string;
  html?: string;
};

const assertSmtpConfigured = () => {
  if (!env.emailFrom) throw new Error("EMAIL_FROM is not configured");
  if (!env.smtpHost) throw new Error("SMTP_HOST is not configured");
  if (!env.smtpPort) throw new Error("SMTP_PORT is not configured");
  if (!env.smtpUser) throw new Error("SMTP_USER is not configured");
  if (!env.smtpPass) throw new Error("SMTP_PASS is not configured");
};

export const sendSmtpEmail = async (toEmail: string, content: EmailContent) => {
  assertSmtpConfigured();

  const transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });

  await transporter.sendMail({
    from: env.emailFrom,
    to: toEmail,
    subject: content.subject,
    text: content.text,
    html: content.html,
  });
};

