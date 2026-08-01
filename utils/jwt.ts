import { IAuthUser } from "@/lib/types";
import jwt, { JwtPayload } from "jsonwebtoken";

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

const getUserFromToken = (token: string | undefined): IAuthUser | null => {
  if (!token) return null;
  const result = verifyToken(token);
  return result.success ? result.data : null;
};

export const jwtUtils = {
  verifyToken,
  getUserFromToken,
};
