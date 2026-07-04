import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { Role } from '@prisma/client';

export const SESSION_COOKIE_NAME = 'session';
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export type SessionPayload = {
    sub: string;
    role: Role;
    iat: number;
    exp: number;
};

const textEncoder = new TextEncoder();

function getSessionSecret() {
    const secret = process.env.AUTH_SECRET ?? process.env.SESSION_SECRET;

    if (secret) return secret;

    if (process.env.NODE_ENV !== 'production') {
        return 'dev-only-change-this-auth-secret';
    }

    throw new Error('Thiếu AUTH_SECRET trong biến môi trường');
}

function base64UrlEncode(value: string | Buffer) {
    return Buffer.from(value)
        .toString('base64')
        .replaceAll('+', '-')
        .replaceAll('/', '_')
        .replaceAll('=', '');
}

function base64UrlDecode(value: string) {
    const padded = value + '='.repeat((4 - (value.length % 4)) % 4);
    return Buffer.from(padded.replaceAll('-', '+').replaceAll('_', '/'), 'base64').toString('utf8');
}

function sign(data: string) {
    return createHmac('sha256', textEncoder.encode(getSessionSecret())).update(data).digest();
}

export function createJwt(payload: Omit<SessionPayload, 'iat' | 'exp'>) {
    const now = Math.floor(Date.now() / 1000);
    const header = {
        alg: 'HS256',
        typ: 'JWT',
    };
    const body: SessionPayload = {
        ...payload,
        iat: now,
        exp: now + SESSION_MAX_AGE_SECONDS,
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedBody = base64UrlEncode(JSON.stringify(body));
    const unsignedToken = `${encodedHeader}.${encodedBody}`;
    const signature = base64UrlEncode(sign(unsignedToken));

    return `${unsignedToken}.${signature}`;
}

export function verifyJwt(token: string) {
    const [encodedHeader, encodedBody, signature] = token.split('.');

    if (!encodedHeader || !encodedBody || !signature) {
        return null;
    }

    const unsignedToken = `${encodedHeader}.${encodedBody}`;
    const expectedSignature = base64UrlEncode(sign(unsignedToken));
    const actual = Buffer.from(signature);
    const expected = Buffer.from(expectedSignature);

    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
        return null;
    }

    try {
        const payload = JSON.parse(base64UrlDecode(encodedBody)) as SessionPayload;

        if (!payload.sub || !payload.role || !payload.exp) {
            return null;
        }

        if (payload.exp < Math.floor(Date.now() / 1000)) {
            return null;
        }

        return payload;
    } catch {
        return null;
    }
}

export async function createSession(user: { id: string; role: Role }) {
    const token = createJwt({
        sub: user.id,
        role: user.role,
    });

    const expires = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires,
        path: '/',
    });

    return {
        token,
        expires,
    };
}

export async function getSession() {
    const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
        return null;
    }

    return verifyJwt(token);
}

export async function deleteSession() {
    (await cookies()).delete(SESSION_COOKIE_NAME);
}
