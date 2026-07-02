import { Request, Response } from "express";
import { z } from "zod";
import {
  followUser,
  getUserProfile,
  searchUsers,
  suggestUsers,
  unfollowUser,
} from "../services/social.service";

const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(100),
});

const idParamSchema = z.object({ id: z.coerce.number().int().positive() });

export async function search(req: Request, res: Response) {
  const { q } = searchQuerySchema.parse(req.query);
  const users = await searchUsers(q, req.userId as number);
  return res.status(200).json({ users });
}

export async function suggestions(req: Request, res: Response) {
  const users = await suggestUsers(req.userId as number);
  return res.status(200).json({ users });
}

export async function profile(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  const viewerId = req.userId ?? null;
  const user = await getUserProfile(id, viewerId);
  return res.status(200).json({ user });
}

export async function follow(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  await followUser(req.userId as number, id);
  return res.status(204).send();
}

export async function unfollow(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  await unfollowUser(req.userId as number, id);
  return res.status(204).send();
}
