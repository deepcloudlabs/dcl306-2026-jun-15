import { apiRequest } from "./http";
import type { LoginResponse } from "../types/auth";

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function getPublicMessage(): Promise<{ message: string; timestamp: string }> {
  return apiRequest<{ message: string; timestamp: string }>("/api/public");
}

export function getMe(token: string): Promise<{
  message: string;
  user: {
    sub: string;
    email: string;
    name: string;
    role: "admin" | "user";
    iat: number;
    exp: number;
  };
}> {
  return apiRequest("/api/me", { token });
}

export function getAdminReports(token: string): Promise<{
  message: string;
  requestedBy: unknown;
  report: {
    activeUsers: number;
    openRiskEvents: number;
    generatedAt: string;
  };
}> {
  return apiRequest("/api/admin/reports", { token });
}
