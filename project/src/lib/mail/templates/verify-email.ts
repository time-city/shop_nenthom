export function verifyEmailTemplate(otp: string) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Xác nhận email của bạn</h2>
      <p>Mã OTP của bạn là:</p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">
        ${otp}
      </div>
      <p style="color: #888; font-size: 14px;">Mã có hiệu lực trong 5 phút.</p>
    </div>
  `
}