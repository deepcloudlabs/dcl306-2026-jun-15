import { Router } from "express";
import { z } from "zod";
import { login } from "../auth/auth.service.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid login payload.",
      issues: parsed.error.flatten(),
    });
    return;
  }

  const result = await login(parsed.data.email, parsed.data.password);

  if (!result) {
    res.status(401).json({
      message: "Invalid email or password.",
    });
    return;
  }

  res.json(result);
});
