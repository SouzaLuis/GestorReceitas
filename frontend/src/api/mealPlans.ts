import { apiClient } from "./client";
import type { MealPlan, MealType, ShoppingListEntry } from "../types";

export async function getWeekPlan(weekStart: string): Promise<MealPlan> {
  const { data } = await apiClient.get<{ plan: MealPlan }>("/api/meal-plans", {
    params: { weekStart },
  });
  return data.plan;
}

export async function addMealPlanItem(input: {
  weekStartDate: string;
  recipeId: number;
  dayOfWeek: number;
  mealType: MealType;
}): Promise<void> {
  await apiClient.post("/api/meal-plans/items", input);
}

export async function removeMealPlanItem(itemId: number): Promise<void> {
  await apiClient.delete(`/api/meal-plans/items/${itemId}`);
}

export async function getShoppingList(weekStart: string): Promise<ShoppingListEntry[]> {
  const { data } = await apiClient.get<{ ingredients: ShoppingListEntry[] }>(
    "/api/meal-plans/shopping-list",
    { params: { weekStart } }
  );
  return data.ingredients;
}
