import { SignJWT, jwtVerify, type JWTPayload } from "jose";

function encodeSecret(secret: string) {
  return new TextEncoder().encode(secret);
}

interface TokenPayload extends JWTPayload {
  sub: string;
  tenantId: string;
  email: string;
  role: string;
  type: "access" | "refresh";
}

export async function signJwt(
  payload: Omit<TokenPayload, "iat" | "exp">,
  secret: string,
  expiresIn: string = "15m"
): Promise<string> {
  return new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(encodeSecret(secret));
}

export async function verifyJwt(
  token: string,
  secret: string
): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, encodeSecret(secret));
  return payload as TokenPayload;
}

export function generateAccessToken(
  userId: string,
  tenantId: string,
  email: string,
  role: string,
  secret: string
) {
  return signJwt({ sub: userId, tenantId, email, role, type: "access" }, secret, "15m");
}

export function generateRefreshToken(
  userId: string,
  tenantId: string,
  email: string,
  role: string,
  secret: string
) {
  return signJwt({ sub: userId, tenantId, email, role, type: "refresh" }, secret, "7d");
}
