export interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Recipe {
  id: number;
  authorId: number;
  title: string;
  description: string | null;
  category: string | null;
  prepTimeMinutes: number | null;
  servings: number | null;
  imageUrl: string | null;
  ingredients: string[];
  instructions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RecipeFormValues {
  title: string;
  description: string;
  category: string;
  prepTimeMinutes: string;
  servings: string;
  ingredients: string[];
  instructions: string;
  image: File | null;
}

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface MealPlanItem {
  id: number;
  mealPlanId: number;
  recipeId: number;
  dayOfWeek: number;
  mealType: MealType;
  recipeTitle: string;
  recipeImageUrl: string | null;
}

export interface MealPlan {
  id: number;
  weekStartDate: string;
  items: MealPlanItem[];
}

export interface ShoppingListEntry {
  name: string;
  count: number;
}

export interface UserSearchResult {
  id: number;
  name: string;
  avatarUrl: string | null;
  recipeCount: number;
  followerCount: number;
  isFollowing: boolean;
}

export interface UserProfile {
  id: number;
  name: string;
  avatarUrl: string | null;
  recipeCount: number;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  following: { id: number; name: string; avatarUrl: string | null }[];
}
