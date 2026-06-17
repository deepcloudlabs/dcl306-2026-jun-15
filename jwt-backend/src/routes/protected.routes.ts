import { Router } from "express";
import { authenticateJwt } from "../middleware/authenticateJwt.js";
import { requireRole } from "../middleware/requireRole.js";
import type { AuthenticatedRequest } from "../types.js";

export const protectedRouter = Router();

protectedRouter.get("/public", (_req, res) => {
  res.json({
    message: "This endpoint is public. No JWT is required.",
    timestamp: new Date().toISOString(),
  });
});

protectedRouter.get("/me", authenticateJwt, (req: AuthenticatedRequest, res) => {
  res.json({
    message: "You accessed a protected endpoint with a valid JWT.",
    user: req.user,
  });
});

protectedRouter.get(
  "/admin/reports",
  authenticateJwt,
  requireRole("admin"),
  (req: AuthenticatedRequest, res) => {
    res.json({
      message: "You accessed an admin-only endpoint.",
      requestedBy: req.user,
      report: {
        activeUsers: 128,
        openRiskEvents: 3,
        generatedAt: new Date().toISOString(),
      },
    });
  },
);
