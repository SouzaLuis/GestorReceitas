import bcrypt from "bcrypt";
import { pool } from "../config/db";
import { ApiError } from "../middleware/errorHandler";
import { signToken } from "../utils/jwt";

const SALT_ROUNDS = 12;

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string | null;
  google_id: string | null;
  avatar_url: string | null;
}

export function toPublicUser(user: User) {
  return { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatar_url };
}

export async function registerUser(name: string, email: string, password: string) {
  const existing = await pool.query<User>("SELECT * FROM users WHERE email = $1", [email]);
  if (existing.rowCount) {
    throw new ApiError(409, "Email already registered");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await pool.query<User>(
    `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *`,
    [name, email, passwordHash]
  );

  const user = result.rows[0];
  return { user: toPublicUser(user), token: signToken({ userId: user.id }) };
}

export async function loginUser(email: string, password: string) {
  const result = await pool.query<User>("SELECT * FROM users WHERE email = $1", [email]);
  const user = result.rows[0];

  if (!user || !user.password_hash) {
    throw new ApiError(401, "Invalid credentials");
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new ApiError(401, "Invalid credentials");
  }

  return { user: toPublicUser(user), token: signToken({ userId: user.id }) };
}

export async function findOrCreateGoogleUser(profile: {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}) {
  const existing = await pool.query<User>(
    "SELECT * FROM users WHERE google_id = $1 OR email = $2",
    [profile.googleId, profile.email]
  );

  if (existing.rowCount) {
    const user = existing.rows[0];
    if (!user.google_id) {
      await pool.query("UPDATE users SET google_id = $1 WHERE id = $2", [
        profile.googleId,
        user.id,
      ]);
    }
    return user;
  }

  const inserted = await pool.query<User>(
    `INSERT INTO users (name, email, google_id, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *`,
    [profile.name, profile.email, profile.googleId, profile.avatarUrl ?? null]
  );

  return inserted.rows[0];
}
