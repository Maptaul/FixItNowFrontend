import jwt, { JwtPayload } from "jsonwebtoken";
import { IAuthUser } from "@/lib/types";

/**
 * Token helpers used by the proxy (route protection) and the auth actions.
 *
 * Authorization is *never* decided here alone. The backend re-verifies every
 * token and re-reads the user's role and ban status from the database on each
 * request, so the worst a tampered cookie can do is render an empty shell
 * whose data calls all fail. This module exists to route people sensibly.
 *
 * When `JWT_ACCESS_SECRET` is configured (it should be — same value as the
 * backend) the signature is verified here too, and a forged cookie never
 * gets past the proxy at all.
 */

export type VerifyResult =
  | { success: true; data: IAuthUser }
  | { success: false; error: string };

const isAuthUser = (payload: unknown): payload is IAuthUser => {
  if (!payload || typeof payload !== "object") return false;
  const claims = payload as JwtPayload;
  return typeof claims.id === "string" && typeof claims.role === "string";
};

const verifyToken = (token: string): VerifyResult => {
  const secret = process.env.JWT_ACCESS_SECRET;

  try {
    const payload = secret
      ? jwt.verify(token, secret)
      : // No shared secret configured — decode and lean on the backend,
        // which rejects anything forged.
        jwt.decode(token);

    if (!isAuthUser(payload)) {
      return { success: false, error: "Token is missing expected claims" };
    }

    return { success: true, data: payload };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Invalid token",
    };
  }
};

/** Read the signed-in user's claims, or `null` when there's no valid token. */
const getUserFromToken = (token: string | undefined): IAuthUser | null => {
  if (!token) return null;
  const result = verifyToken(token);
  return result.success ? result.data : null;
};

export const jwtUtils = {
  verifyToken,
  getUserFromToken,
};
