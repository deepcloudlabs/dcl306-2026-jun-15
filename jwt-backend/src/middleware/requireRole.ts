import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest, UserRole } from "../types.js";

export function requireRole(requiredRole: UserRole) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Authentication is required." });
      return;
    }

    if (req.user.role !== requiredRole) {
      res.status(403).json({
        message: `Forbidden. Required role: ${requiredRole}.`,
      });
      return;
    }

    next();
  };
}
