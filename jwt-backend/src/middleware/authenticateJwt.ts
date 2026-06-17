import type { NextFunction, Response } from "express";
import { verifyAccessToken } from "../auth/auth.service.js";
import type { AuthenticatedRequest } from "../types.js";

function extractBearerToken(authorizationHeader: string | undefined): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

export function authenticateJwt(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    res.status(401).json({
      message: "Missing Authorization header. Expected: Bearer <accessToken>",
    });
    return;
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    res.status(401).json({
      message: "Invalid or expired access token.",
    });
  }
}
