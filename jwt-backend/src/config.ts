import dotenv from "dotenv";

dotenv.config();

function readRequiredEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: readRequiredEnv("CORS_ORIGIN", "http://localhost:5173"),
  jwtSecret: readRequiredEnv("JWT_SECRET"),
  jwtExpiresIn: readRequiredEnv("JWT_EXPIRES_IN", "15m"),
};
