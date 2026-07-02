import { apiClient } from "./client";
import type { Recipe, RecipeFormValues } from "../types";

export interface RecipeFilters {
  search?: string;
  category?: string;
  maxPrepTime?: number;
  authorId?: number;
}

export async function listRecipes(filters: RecipeFilters = {}): Promise<Recipe[]> {
  const { data } = await apiClient.get<{ recipes: Recipe[] }>("/api/recipes", {
    params: filters,
  });
  return data.recipes;
}

export async function getRecipe(id: number): Promise<Recipe> {
  const { data } = await apiClient.get<{ recipe: Recipe }>(`/api/recipes/${id}`);
  return data.recipe;
}

export async function listMyFavorites(): Promise<Recipe[]> {
  const { data } = await apiClient.get<{ recipes: Recipe[] }>("/api/recipes/favorites");
  return data.recipes;
}

export async function listFeed(): Promise<Recipe[]> {
  const { data } = await apiClient.get<{ recipes: Recipe[] }>("/api/recipes/feed");
  return data.recipes;
}

function buildFormData(values: RecipeFormValues): FormData {
  const formData = new FormData();
  formData.append("title", values.title);
  if (values.description) formData.append("description", values.description);
  if (values.category) formData.append("category", values.category);
  if (values.prepTimeMinutes) formData.append("prepTimeMinutes", values.prepTimeMinutes);
  if (values.servings) formData.append("servings", values.servings);
  const instructionSteps = values.instructions
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  formData.append("ingredients", JSON.stringify(values.ingredients));
  formData.append("instructions", JSON.stringify(instructionSteps));
  if (values.image) formData.append("image", values.image);
  return formData;
}

export async function createRecipe(values: RecipeFormValues): Promise<Recipe> {
  const { data } = await apiClient.post<{ recipe: Recipe }>(
    "/api/recipes",
    buildFormData(values),
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data.recipe;
}

export async function updateRecipe(id: number, values: RecipeFormValues): Promise<Recipe> {
  const { data } = await apiClient.put<{ recipe: Recipe }>(
    `/api/recipes/${id}`,
    buildFormData(values),
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data.recipe;
}

export async function deleteRecipe(id: number): Promise<void> {
  await apiClient.delete(`/api/recipes/${id}`);
}

export async function favoriteRecipe(id: number): Promise<void> {
  await apiClient.post(`/api/recipes/${id}/favorite`);
}

export async function unfavoriteRecipe(id: number): Promise<void> {
  await apiClient.delete(`/api/recipes/${id}/favorite`);
}
