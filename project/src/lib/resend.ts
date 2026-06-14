type SendResetPasswordEmailParams = {
  email: string;
  otp: string;
  resetUrl: string;
};

const RESEND_API_URL = "https://api.resend.com/emails";

export async function sendResetPasswordEmail({
  email,
  otp,
  resetUrl,
}: SendResetPasswordEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    throw new Error("Chưa thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.");
  }

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: "Đặt lại mật khẩu ChamCham",
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
    }),
  });

  if (!response.ok) {
    throw new Error("Chưa thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.");
  }
}
