import { pool } from "../../config/db";
import { ApiError } from "../../middleware/errorHandler";
import {
  addFavorite,
  createRecipe,
  deleteRecipe,
  getRecipeById,
  listRecipes,
  updateRecipe,
} from "../recipes.service";

jest.mock("../../config/db", () => ({
  pool: { query: jest.fn() },
}));

const mockedQuery = pool.query as jest.Mock;

const baseRecipeRow = {
  id: 1,
  author_id: 10,
  title: "Bolo de cenoura",
  description: null,
  category: "sobremesa",
  prep_time_minutes: 60,
  servings: 8,
  image_url: null,
  ingredients: ["cenoura", "farinha"],
  instructions: ["misturar", "assar"],
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

describe("recipes.service", () => {
  it("creates a recipe", async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [baseRecipeRow] });

    const recipe = await createRecipe(10, {
      title: "Bolo de cenoura",
      ingredients: ["cenoura", "farinha"],
      instructions: ["misturar", "assar"],
    });

    expect(recipe.title).toBe("Bolo de cenoura");
    expect(recipe.authorId).toBe(10);
  });

  it("lists recipes applying search/category/authorId filters", async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [baseRecipeRow] });

    const recipes = await listRecipes({ search: "bolo", category: "sobremesa", authorId: 10 });

    expect(recipes).toHaveLength(1);
    const [, values] = mockedQuery.mock.calls[0];
    expect(values).toEqual(["%bolo%", "sobremesa", 10]);
  });

  it("throws 404 when recipe is not found", async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [] });
    await expect(getRecipeById(999)).rejects.toThrow(ApiError);
  });

  it("allows the author to update their recipe", async () => {
    mockedQuery
      .mockResolvedValueOnce({ rows: [{ author_id: 10 }] })
      .mockResolvedValueOnce({ rows: [{ ...baseRecipeRow, title: "Bolo atualizado" }] });

    const recipe = await updateRecipe(1, 10, {
      title: "Bolo atualizado",
      ingredients: ["cenoura"],
      instructions: ["assar"],
    });

    expect(recipe.title).toBe("Bolo atualizado");
  });

  it("rejects update from a non-owner", async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ author_id: 10 }] });

    await expect(
      updateRecipe(1, 999, { title: "x", ingredients: ["a"], instructions: ["b"] })
    ).rejects.toThrow(ApiError);
  });

  it("rejects delete for a recipe that does not exist", async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [] });
    await expect(deleteRecipe(1, 10)).rejects.toThrow(ApiError);
  });

  it("adds a favorite only when the recipe exists", async () => {
    mockedQuery
      .mockResolvedValueOnce({ rows: [baseRecipeRow] })
      .mockResolvedValueOnce({ rows: [] });

    await expect(addFavorite(5, 1)).resolves.toBeUndefined();
  });

  it("rejects favoriting a non-existent recipe", async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [] });
    await expect(addFavorite(5, 999)).rejects.toThrow(ApiError);
  });
});
