import nodemailer from "nodemailer";

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
  throw new Error(
    "GMAIL_USER and GMAIL_APP_PASSWORD must be set in the environment (.env)",
  );
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

export async function sendOtpEmail(to: string, otp: string) {
  await transporter.sendMail({
    from: `"InstantPay" <${GMAIL_USER}>`,
    to,
    subject: "Your verification code",
    html: `<p>Your code is <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
  });
}
