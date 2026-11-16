import crypto from 'crypto';

// Short-lived proof that a phone number passed WhatsApp OTP verification.
// Format: "<expiresAtMs>.<hmac>", signed with NEXTAUTH_SECRET.
const TOKEN_TTL_MS = 15 * 60 * 1000;

function sign(phone: string, expiresAt: number) {
  return crypto
    .createHmac('sha256', process.env.NEXTAUTH_SECRET as string)
    .update(`${phone}.${expiresAt}`)
    .digest('hex');
}

export function createPhoneVerificationToken(phone: string) {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  return `${expiresAt}.${sign(phone, expiresAt)}`;
}

export function isValidPhoneVerificationToken(phone: string, token?: string | null) {
  if (!token || !process.env.NEXTAUTH_SECRET) {
    return false;
  }

  const [expiresAtRaw, signature] = token.split('.');
  const expiresAt = Number(expiresAtRaw);
  if (!expiresAt || !signature || Date.now() > expiresAt) {
    return false;
  }

  const expected = sign(phone, expiresAt);
  return (
    signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  );
}
