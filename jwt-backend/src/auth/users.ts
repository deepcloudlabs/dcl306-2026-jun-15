import bcrypt from "bcryptjs";
import type { PublicUser, UserRole } from "../types.js";

export type UserRecord = PublicUser & {
  passwordHash: string;
};

function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

/**
 * Educational in-memory user repository.
 *
 * In production, replace this with a database-backed repository and
 * never store plaintext passwords. Passwords are hashed here to keep the
 * example realistic while remaining self-contained.
 */
export const users: UserRecord[] = [
  {
    id: "1",
    email: "jack@example.com",
    name: "Jack Bauer",
    role: "admin" satisfies UserRole,
    passwordHash: hashPassword("admin123"),
  },
  {
    id: "2",
    email: "kate@example.com",
    name: "Kate Austen",
    role: "user" satisfies UserRole,
    passwordHash: hashPassword("user123"),
  },
];

export function toPublicUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export function findUserByEmail(email: string): UserRecord | undefined {
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}
