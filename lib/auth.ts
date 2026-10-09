import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const COOKIE_NAME = "token";
export const MAX_AGE = 60 * 60 * 24 * 7;

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET);

export async function signToken(id: number, username: string) {
  return new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(id))
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function getUserId(): Promise<number | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return Number(payload.sub);
  } catch {
    return null;
  }
}
