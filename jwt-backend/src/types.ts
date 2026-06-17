import type { Request } from "express";

export type UserRole = "admin" | "user";

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export type JwtPayload = {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
};

export type AuthenticatedRequest = Request & {
  user?: JwtPayload;
};
