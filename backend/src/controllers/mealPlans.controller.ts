import { Request, Response } from "express";
import { z } from "zod";
import {
  addItem,
  getShoppingList,
  getWeekPlan,
  removeItem,
} from "../services/mealPlans.service";

const weekStartSchema = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "weekStart must be in YYYY-MM-DD format"),
});

const addItemSchema = z.object({
  weekStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "weekStartDate must be in YYYY-MM-DD format"),
  recipeId: z.coerce.number().int().positive(),
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]).default("dinner"),
});

const idParamSchema = z.object({ id: z.coerce.number().int().positive() });

export async function getPlan(req: Request, res: Response) {
  const { weekStart } = weekStartSchema.parse(req.query);
  const plan = await getWeekPlan(req.userId as number, weekStart);
  return res.status(200).json({ plan });
}

export async function addPlanItem(req: Request, res: Response) {
  const input = addItemSchema.parse(req.body);
  const item = await addItem(
    req.userId as number,
    input.weekStartDate,
    input.recipeId,
    input.dayOfWeek,
    input.mealType
  );
  return res.status(201).json({ item });
}

export async function removePlanItem(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  await removeItem(req.userId as number, id);
  return res.status(204).send();
}

export async function shoppingList(req: Request, res: Response) {
  const { weekStart } = weekStartSchema.parse(req.query);
  const ingredients = await getShoppingList(req.userId as number, weekStart);
  return res.status(200).json({ ingredients });
}
