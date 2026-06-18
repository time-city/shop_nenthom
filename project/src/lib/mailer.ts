import nodemailer from "nodemailer";
import type {
  SendOrderBillEmailParams,
  SendOrderCancellationEmailParams,
  SendResetPasswordEmailParams,
} from "./types/email";

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

function createMailTransporter() {
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

  return { from, transporter };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Gửi email OTP đặt lại mật khẩu.
export async function sendResetPasswordEmail({ email, otp, resetUrl }: SendResetPasswordEmailParams) {
  const { from, transporter } = createMailTransporter();

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

// Gửi bill đơn hàng cho cả khách vãng lai và user đã đăng nhập sau khi tạo đơn thành công.
export async function sendOrderBillEmail(params: SendOrderBillEmailParams) {
  const { from, transporter } = createMailTransporter();
  const paymentText =
    params.paymentMethod === "cod"
      ? "Thanh toán khi nhận hàng"
      : "Chuyển khoản ngân hàng";
  const itemRows = params.items
    .map((item) => {
      const optionText = [item.scent, item.size, item.color, item.pack]
        .filter(Boolean)
        .map((value) => escapeHtml(String(value)))
        .join(", ");

      return `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eadfd2;">
            <div style="font-weight: 700; color: #2C1810;">${escapeHtml(item.name)}</div>
            <div style="font-size: 13px; color: #6B4C35;">${optionText}</div>
            <div style="font-size: 13px; color: #6B4C35;">Số lượng: ${item.quantity}</div>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eadfd2; text-align: right; white-space: nowrap;">
            ${formatCurrency(item.price * item.quantity)}
          </td>
        </tr>
      `;
    })
    .join("");

  await transporter.sendMail({
    from,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #2C1810; background: #F8F0E4; padding: 24px;">
        <div style="max-width: 640px; margin: 0 auto; background: #fffaf3; border: 1px solid #eadfd2; padding: 28px;">
          <h2 style="margin: 0 0 8px; color: #6B1218;">ChamCham đã nhận đơn hàng của bạn</h2>
          <p style="margin: 0 0 20px;">Cảm ơn ${escapeHtml(params.fullname)} đã đặt hàng. Dưới đây là thông tin đơn hàng của bạn.</p>

          <div style="background: #F8F0E4; padding: 16px; margin-bottom: 20px;">
            <div><strong>Mã đơn hàng:</strong> #${escapeHtml(params.orderNumber)}</div>
            <div><strong>Phương thức thanh toán:</strong> ${paymentText}</div>
            <div><strong>Người nhận:</strong> ${escapeHtml(params.fullname)}</div>
            <div><strong>Số điện thoại:</strong> ${escapeHtml(params.phone)}</div>
            <div><strong>Địa chỉ:</strong> ${escapeHtml(params.address)}, ${escapeHtml(params.city)}</div>
          </div>

          <table style="width: 100%; border-collapse: collapse;">
            <tbody>${itemRows}</tbody>
          </table>

          <div style="margin-top: 20px; border-top: 2px solid #eadfd2; padding-top: 16px;">
            <div style="display: flex; justify-content: space-between;">
              <span>Tạm tính:</span>
              <strong>${formatCurrency(params.subtotal)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Phí vận chuyển:</span>
              <strong>${formatCurrency(params.shipping)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 18px; color: #6B1218; margin-top: 8px;">
              <span>Tổng cộng:</span>
              <strong>${formatCurrency(params.total)}</strong>
            </div>
          </div>

          <p style="margin-top: 24px; color: #6B4C35;">ChamCham sẽ liên hệ nếu cần xác nhận thêm thông tin giao hàng.</p>
        </div>
      </div>
    `,
    subject: `Hóa đơn đơn hàng #${params.orderNumber}`,
    to: params.email,
  });
}

// Gửi thông báo cho khách khi admin hủy đơn hàng.
export async function sendOrderCancellationEmail(
  params: SendOrderCancellationEmailParams,
) {
  const { from, transporter } = createMailTransporter();

  await transporter.sendMail({
    from,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #2C1810; background: #F8F0E4; padding: 24px;">
        <div style="max-width: 640px; margin: 0 auto; background: #fffaf3; border: 1px solid #eadfd2; padding: 28px;">
          <h2 style="margin: 0 0 8px; color: #6B1218;">Đơn hàng của bạn đã được hủy</h2>
          <p>Xin chào ${escapeHtml(params.fullname)},</p>
          <p>ChamCham xin thông báo đơn hàng <strong>#${escapeHtml(params.orderNumber)}</strong> đã được hủy.</p>
          <div style="background: #F8F0E4; border-left: 4px solid #6B1218; padding: 16px; margin: 20px 0;">
            <strong>Lý do hủy:</strong>
            <div>${escapeHtml(params.reason)}</div>
          </div>
          <p>Nếu cần hỗ trợ thêm, vui lòng liên hệ ChamCham để được giải đáp.</p>
        </div>
      </div>
    `,
    subject: `Thông báo hủy đơn hàng #${params.orderNumber}`,
    to: params.email,
  });
}
