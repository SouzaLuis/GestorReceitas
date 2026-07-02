import { pool } from "../config/db";
import { ApiError } from "../middleware/errorHandler";

export interface Recipe {
  id: number;
  author_id: number;
  title: string;
  description: string | null;
  category: string | null;
  prep_time_minutes: number | null;
  servings: number | null;
  image_url: string | null;
  ingredients: string[];
  instructions: string[];
  created_at: string;
  updated_at: string;
}

export interface RecipeInput {
  title: string;
  description?: string;
  category?: string;
  prepTimeMinutes?: number;
  servings?: number;
  imageUrl?: string;
  ingredients: string[];
  instructions: string[];
}

export interface RecipeFilters {
  search?: string;
  category?: string;
  maxPrepTime?: number;
  authorId?: number;
}

export function toPublicRecipe(recipe: Recipe) {
  return {
    id: recipe.id,
    authorId: recipe.author_id,
    title: recipe.title,
    description: recipe.description,
    category: recipe.category,
    prepTimeMinutes: recipe.prep_time_minutes,
    servings: recipe.servings,
    imageUrl: recipe.image_url,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    createdAt: recipe.created_at,
    updatedAt: recipe.updated_at,
  };
}

export async function createRecipe(authorId: number, input: RecipeInput) {
  const result = await pool.query<Recipe>(
    `INSERT INTO recipes
       (author_id, title, description, category, prep_time_minutes, servings, image_url, ingredients, instructions)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      authorId,
      input.title,
      input.description ?? null,
      input.category ?? null,
      input.prepTimeMinutes ?? null,
      input.servings ?? null,
      input.imageUrl ?? null,
      JSON.stringify(input.ingredients),
      JSON.stringify(input.instructions),
    ]
  );

  return toPublicRecipe(result.rows[0]);
}

export async function listRecipes(filters: RecipeFilters) {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (filters.search) {
    values.push(`%${filters.search}%`);
    conditions.push(`title ILIKE $${values.length}`);
  }
  if (filters.category) {
    values.push(filters.category);
    conditions.push(`category = $${values.length}`);
  }
  if (filters.maxPrepTime !== undefined) {
    values.push(filters.maxPrepTime);
    conditions.push(`prep_time_minutes <= $${values.length}`);
  }
  if (filters.authorId !== undefined) {
    values.push(filters.authorId);
    conditions.push(`author_id = $${values.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const result = await pool.query<Recipe>(
    `SELECT * FROM recipes ${whereClause} ORDER BY created_at DESC`,
    values
  );

  return result.rows.map(toPublicRecipe);
}

export async function listFeed(userId: number) {
  const result = await pool.query<Recipe>(
    `SELECT r.* FROM recipes r
     WHERE r.author_id IN (SELECT followed_id FROM follows WHERE follower_id = $1)
     ORDER BY r.created_at DESC`,
    [userId]
  );
  return result.rows.map(toPublicRecipe);
}

export async function getRecipeById(id: number) {
  const result = await pool.query<Recipe>("SELECT * FROM recipes WHERE id = $1", [id]);
  const recipe = result.rows[0];
  if (!recipe) {
    throw new ApiError(404, "Recipe not found");
  }
  return toPublicRecipe(recipe);
}

async function assertOwnership(id: number, authorId: number) {
  const result = await pool.query<Recipe>("SELECT author_id FROM recipes WHERE id = $1", [id]);
  const recipe = result.rows[0];
  if (!recipe) {
    throw new ApiError(404, "Recipe not found");
  }
  if (recipe.author_id !== authorId) {
    throw new ApiError(403, "You are not allowed to modify this recipe");
  }
}

export async function updateRecipe(id: number, authorId: number, input: RecipeInput) {
  await assertOwnership(id, authorId);

  const result = await pool.query<Recipe>(
    `UPDATE recipes SET
       title = $1,
       description = $2,
       category = $3,
       prep_time_minutes = $4,
       servings = $5,
       image_url = COALESCE($6, image_url),
       ingredients = $7,
       instructions = $8,
       updated_at = now()
     WHERE id = $9
     RETURNING *`,
    [
      input.title,
      input.description ?? null,
      input.category ?? null,
      input.prepTimeMinutes ?? null,
      input.servings ?? null,
      input.imageUrl ?? null,
      JSON.stringify(input.ingredients),
      JSON.stringify(input.instructions),
      id,
    ]
  );

  return toPublicRecipe(result.rows[0]);
}

export async function deleteRecipe(id: number, authorId: number) {
  await assertOwnership(id, authorId);
  await pool.query("DELETE FROM recipes WHERE id = $1", [id]);
}

export async function addFavorite(userId: number, recipeId: number) {
  await getRecipeById(recipeId);
  await pool.query(
    `INSERT INTO favorites (user_id, recipe_id) VALUES ($1, $2)
     ON CONFLICT (user_id, recipe_id) DO NOTHING`,
    [userId, recipeId]
  );
}

export async function removeFavorite(userId: number, recipeId: number) {
  await pool.query("DELETE FROM favorites WHERE user_id = $1 AND recipe_id = $2", [
    userId,
    recipeId,
  ]);
}

export async function listFavorites(userId: number) {
  const result = await pool.query<Recipe>(
    `SELECT r.* FROM recipes r
     INNER JOIN favorites f ON f.recipe_id = r.id
     WHERE f.user_id = $1
     ORDER BY f.created_at DESC`,
    [userId]
  );
  return result.rows.map(toPublicRecipe);
}
