import { Request, Response } from "express";
import { z } from "zod";
import { env } from "../config/env";
import { loginUser, registerUser, toPublicUser, User } from "../services/auth.service";
import { signToken } from "../utils/jwt";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(72),
});

export async function register(req: Request, res: Response) {
  const { name, email, password } = registerSchema.parse(req.body);
  const result = await registerUser(name, email, password);
  return res.status(201).json(result);
}

export async function login(req: Request, res: Response) {
  const { email, password } = loginSchema.parse(req.body);
  const result = await loginUser(email, password);
  return res.status(200).json(result);
}

export function googleCallback(req: Request, res: Response) {
  const user = req.user as User;
  const token = signToken({ userId: user.id });
  // SPA finishes the OAuth flow by reading the token from the redirect URL.
  return res.redirect(`${env.frontendUrl}/oauth/callback?token=${token}`);
}
