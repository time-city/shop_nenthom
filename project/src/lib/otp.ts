import { createHmac, timingSafeEqual, randomInt } from 'crypto'

const OTP_SECRET = process.env.AUTH_SECRET ?? 'dev-only-secret'
const OTP_EXPIRE_SECONDS = 5 * 60 // 5 phút

export function generateOtp() {
  return randomInt(0, 1_000_000).toString().padStart(6, '0')
}

function hashOtp(email: string, otp: string) {
  return createHmac('sha256', OTP_SECRET).update(`${email}:${otp}`).digest('base64url')
}

export function createOtpToken(email: string, otp: string) {
  const payload = {
    email,
    otpHash: hashOtp(email, otp),
    exp: Math.floor(Date.now() / 1000) + OTP_EXPIRE_SECONDS,
  }

  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = createHmac('sha256', OTP_SECRET).update(data).digest('base64url')

  return `${data}.${sig}`
}

export function verifyOtpToken(token: string, email: string, otp: string) {
  const [data, sig] = token.split('.')
  if (!data || !sig) return false

  const expectedSig = createHmac('sha256', OTP_SECRET).update(data).digest('base64url')

  const sigBuf = Buffer.from(sig)
  const expectedBuf = Buffer.from(expectedSig)
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) return false

  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString())

    if (payload.exp < Math.floor(Date.now() / 1000)) return false
    if (payload.email !== email) return false
    if (payload.otpHash !== hashOtp(email, otp)) return false

    return true
  } catch {
    return false
  }
}
