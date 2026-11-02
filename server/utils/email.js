import nodemailer from 'nodemailer';

export const isEmailConfigured = () => Boolean(
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS
);

export const sendPasswordResetEmail = async (email, resetUrl) => {
  if (!isEmailConfigured()) {
    throw new Error('SMTP email settings are incomplete');
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'Reset your RoomFinder password',
    text: `Use this link to reset your RoomFinder password. It expires in one hour:\n\n${resetUrl}`,
    html: `<p>Use the link below to reset your RoomFinder password. It expires in one hour.</p><p><a href="${resetUrl}">Reset password</a></p>`
  });
};
