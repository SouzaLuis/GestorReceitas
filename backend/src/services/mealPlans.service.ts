import { pool } from "../config/db";
import { ApiError } from "../middleware/errorHandler";

export interface MealPlanItem {
  id: number;
  mealPlanId: number;
  recipeId: number;
  dayOfWeek: number;
  mealType: string;
  recipeTitle: string;
  recipeImageUrl: string | null;
}

interface MealPlanRow {
  id: number;
  user_id: number;
  week_start_date: string;
}

interface MealPlanItemRow {
  id: number;
  meal_plan_id: number;
  recipe_id: number;
  day_of_week: number;
  meal_type: string;
  title: string;
  image_url: string | null;
}

function toPublicItem(row: MealPlanItemRow): MealPlanItem {
  return {
    id: row.id,
    mealPlanId: row.meal_plan_id,
    recipeId: row.recipe_id,
    dayOfWeek: row.day_of_week,
    mealType: row.meal_type,
    recipeTitle: row.title,
    recipeImageUrl: row.image_url,
  };
}

async function getOrCreatePlan(userId: number, weekStartDate: string): Promise<MealPlanRow> {
  const existing = await pool.query<MealPlanRow>(
    "SELECT * FROM meal_plans WHERE user_id = $1 AND week_start_date = $2",
    [userId, weekStartDate]
  );
  if (existing.rowCount) {
    return existing.rows[0];
  }

  const created = await pool.query<MealPlanRow>(
    "INSERT INTO meal_plans (user_id, week_start_date) VALUES ($1, $2) RETURNING *",
    [userId, weekStartDate]
  );
  return created.rows[0];
}

export async function getWeekPlan(userId: number, weekStartDate: string) {
  const plan = await getOrCreatePlan(userId, weekStartDate);
  const items = await pool.query<MealPlanItemRow>(
    `SELECT mpi.*, r.title, r.image_url
     FROM meal_plan_items mpi
     INNER JOIN recipes r ON r.id = mpi.recipe_id
     WHERE mpi.meal_plan_id = $1
     ORDER BY mpi.day_of_week, mpi.id`,
    [plan.id]
  );

  return {
    id: plan.id,
    weekStartDate: plan.week_start_date,
    items: items.rows.map(toPublicItem),
  };
}

export async function addItem(
  userId: number,
  weekStartDate: string,
  recipeId: number,
  dayOfWeek: number,
  mealType: string
) {
  const recipeExists = await pool.query("SELECT id FROM recipes WHERE id = $1", [recipeId]);
  if (!recipeExists.rowCount) {
    throw new ApiError(404, "Recipe not found");
  }

  const plan = await getOrCreatePlan(userId, weekStartDate);
  const result = await pool.query<MealPlanItemRow>(
    `WITH inserted AS (
       INSERT INTO meal_plan_items (meal_plan_id, recipe_id, day_of_week, meal_type)
       VALUES ($1, $2, $3, $4)
       RETURNING *
     )
     SELECT inserted.*, r.title, r.image_url
     FROM inserted
     INNER JOIN recipes r ON r.id = inserted.recipe_id`,
    [plan.id, recipeId, dayOfWeek, mealType]
  );

  return toPublicItem(result.rows[0]);
}

export async function removeItem(userId: number, itemId: number) {
  const result = await pool.query(
    `DELETE FROM meal_plan_items
     WHERE id = $1
       AND meal_plan_id IN (SELECT id FROM meal_plans WHERE user_id = $2)`,
    [itemId, userId]
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, "Meal plan item not found");
  }
}

export interface ShoppingListEntry {
  name: string;
  count: number;
}

export async function getShoppingList(
  userId: number,
  weekStartDate: string
): Promise<ShoppingListEntry[]> {
  const plan = await getOrCreatePlan(userId, weekStartDate);
  const result = await pool.query<{ ingredients: string[] }>(
    `SELECT r.ingredients
     FROM meal_plan_items mpi
     INNER JOIN recipes r ON r.id = mpi.recipe_id
     WHERE mpi.meal_plan_id = $1`,
    [plan.id]
  );

  const counts = new Map<string, ShoppingListEntry>();
  for (const row of result.rows) {
    for (const ingredient of row.ingredients) {
      const key = ingredient.trim().toLowerCase();
      if (!key) continue;
      const existing = counts.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(key, { name: ingredient.trim(), count: 1 });
      }
    }
  }

  return [...counts.values()].sort((a, b) => a.name.localeCompare(b.name));
}
