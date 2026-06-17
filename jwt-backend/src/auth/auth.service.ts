import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import type { JwtPayload, PublicUser } from "../types.js";
import { findUserByEmail, toPublicUser } from "./users.js";

export type LoginResult = {
  accessToken: string;
  user: PublicUser;
};

export async function login(email: string, password: string): Promise<LoginResult | null> {
  const user = findUserByEmail(email);

  if (!user) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    return null;
  }

  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

  return {
    accessToken,
    user: toPublicUser(user),
  };
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
}
