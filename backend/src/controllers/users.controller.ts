import { Request, Response } from "express";
import { pool } from "../config/db";
import { ApiError } from "../middleware/errorHandler";
import { toPublicUser, User } from "../services/auth.service";

export async function me(req: Request, res: Response) {
  const result = await pool.query<User>("SELECT * FROM users WHERE id = $1", [req.userId]);
  const user = result.rows[0];

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json({ user: toPublicUser(user) });
}
