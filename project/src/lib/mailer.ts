import nodemailer from "nodemailer";

type SendResetPasswordEmailParams = {
  email: string;
  otp: string;
  resetUrl: string;
};

function getMailConfig() {
  const user = process.env.SMTP_USER ?? process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASSWORD ?? process.env.GMAIL_APP_PASSWORD;
  const host = process.env.SMTP_HOST ?? "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT ?? 465);
  const secure =
    process.env.SMTP_SECURE === undefined
      ? port === 465
      : process.env.SMTP_SECURE === "true";
  const from = process.env.SMTP_FROM_EMAIL ?? process.env.RESEND_FROM_EMAIL ?? user;

  if (!user || !pass || !from) {
    throw new Error("Chưa thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.");
  }

  return { from, host, pass, port, secure, user };
}

export async function sendResetPasswordEmail({
  email,
  otp,
  resetUrl,
}: SendResetPasswordEmailParams) {
  const { from, host, pass, port, secure, user } = getMailConfig();
  const transporter = nodemailer.createTransport({
    auth: {
      pass,
      user,
    },
    host,
    port,
    secure,
  });

  await transporter.sendMail({
    from,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #2C1810;">
        <h2>Đặt lại mật khẩu</h2>
        <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản ChamCham.</p>
        <p>Mã xác nhận của bạn là:</p>
        <p style="font-size: 24px; font-weight: 700; letter-spacing: 4px;">${otp}</p>
        <p>Bạn cũng có thể mở liên kết sau để tiếp tục:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>Mã xác nhận có hiệu lực trong 5 phút.</p>
        <p>Nếu bạn không yêu cầu thao tác này, hãy bỏ qua email này.</p>
      </div>
    `,
    subject: "Đặt lại mật khẩu ChamCham",
    to: email,
  });
}
