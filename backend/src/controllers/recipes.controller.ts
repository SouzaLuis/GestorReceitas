import { Request, Response } from "express";
import { z } from "zod";
import {
  addFavorite,
  createRecipe,
  deleteRecipe,
  getRecipeById,
  listFavorites,
  listFeed,
  listRecipes,
  removeFavorite,
  updateRecipe,
} from "../services/recipes.service";
import { uploadImageBuffer } from "../services/upload.service";

const recipeSchema = z.object({
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().max(2000).optional(),
  category: z.string().trim().max(60).optional(),
  prepTimeMinutes: z.coerce.number().int().positive().max(1440).optional(),
  servings: z.coerce.number().int().positive().max(100).optional(),
  ingredients: z.array(z.string().trim().min(1)).min(1),
  instructions: z.array(z.string().trim().min(1)).min(1),
});

const listQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  maxPrepTime: z.coerce.number().int().positive().optional(),
  authorId: z.coerce.number().int().positive().optional(),
});

const idParamSchema = z.object({ id: z.coerce.number().int().positive() });

function parseJsonArrayField(raw: unknown): unknown {
  if (typeof raw !== "string") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

async function resolveImageUrl(req: Request): Promise<string | undefined> {
  if (!req.file) return undefined;
  return uploadImageBuffer(req.file.buffer);
}

export async function create(req: Request, res: Response) {
  const input = recipeSchema.parse({
    ...req.body,
    ingredients: parseJsonArrayField(req.body.ingredients),
    instructions: parseJsonArrayField(req.body.instructions),
  });

  const imageUrl = await resolveImageUrl(req);
  const recipe = await createRecipe(req.userId as number, { ...input, imageUrl });
  return res.status(201).json({ recipe });
}

export async function list(req: Request, res: Response) {
  const filters = listQuerySchema.parse(req.query);
  const recipes = await listRecipes(filters);
  return res.status(200).json({ recipes });
}

export async function getOne(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  const recipe = await getRecipeById(id);
  return res.status(200).json({ recipe });
}

export async function update(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  const input = recipeSchema.parse({
    ...req.body,
    ingredients: parseJsonArrayField(req.body.ingredients),
    instructions: parseJsonArrayField(req.body.instructions),
  });

  const imageUrl = await resolveImageUrl(req);
  const recipe = await updateRecipe(id, req.userId as number, { ...input, imageUrl });
  return res.status(200).json({ recipe });
}

export async function remove(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  await deleteRecipe(id, req.userId as number);
  return res.status(204).send();
}

export async function favorite(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  await addFavorite(req.userId as number, id);
  return res.status(204).send();
}

export async function unfavorite(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  await removeFavorite(req.userId as number, id);
  return res.status(204).send();
}

export async function myFavorites(req: Request, res: Response) {
  const recipes = await listFavorites(req.userId as number);
  return res.status(200).json({ recipes });
}

export async function feed(req: Request, res: Response) {
  const recipes = await listFeed(req.userId as number);
  return res.status(200).json({ recipes });
}
