import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config.js";
import { authRouter } from "./routes/auth.routes.js";
import { protectedRouter } from "./routes/protected.routes.js";

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use(
  cors({
    origin: config.corsOrigin,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "jwt-express-backend",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRouter);
app.use("/api", protectedRouter);

app.use((_req, res) => {
  res.status(404).json({
    message: "Route not found.",
  });
});

app.listen(config.port, () => {
  console.log(`JWT Express backend running on http://localhost:${config.port}`);
});
