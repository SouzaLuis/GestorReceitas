import { pool } from "../../config/db";
import { ApiError } from "../../middleware/errorHandler";
import { addItem, getShoppingList, getWeekPlan, removeItem } from "../mealPlans.service";

jest.mock("../../config/db", () => ({
  pool: { query: jest.fn() },
}));

const mockedQuery = pool.query as jest.Mock;

const planRow = { id: 1, user_id: 10, week_start_date: "2026-07-06" };

describe("mealPlans.service", () => {
  beforeEach(() => mockedQuery.mockReset());

  describe("getWeekPlan", () => {
    it("returns an existing plan with its items", async () => {
      mockedQuery
        .mockResolvedValueOnce({ rowCount: 1, rows: [planRow] })
        .mockResolvedValueOnce({
          rows: [
            {
              id: 1,
              meal_plan_id: 1,
              recipe_id: 5,
              day_of_week: 1,
              meal_type: "dinner",
              title: "Bolo",
              image_url: null,
            },
          ],
        });

      const plan = await getWeekPlan(10, "2026-07-06");

      expect(plan.weekStartDate).toBe("2026-07-06");
      expect(plan.items).toHaveLength(1);
      expect(plan.items[0].recipeTitle).toBe("Bolo");
    });

    it("creates a plan when none exists for that week", async () => {
      mockedQuery
        .mockResolvedValueOnce({ rowCount: 0, rows: [] })
        .mockResolvedValueOnce({ rows: [planRow] })
        .mockResolvedValueOnce({ rows: [] });

      const plan = await getWeekPlan(10, "2026-07-06");

      expect(plan.id).toBe(1);
      expect(plan.items).toEqual([]);
    });
  });

  describe("addItem", () => {
    it("adds a recipe to the plan for a given day", async () => {
      mockedQuery
        .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 5 }] }) // recipe exists
        .mockResolvedValueOnce({ rowCount: 1, rows: [planRow] }) // getOrCreatePlan
        .mockResolvedValueOnce({
          rows: [
            {
              id: 1,
              meal_plan_id: 1,
              recipe_id: 5,
              day_of_week: 2,
              meal_type: "lunch",
              title: "Bolo",
              image_url: null,
            },
          ],
        });

      const item = await addItem(10, "2026-07-06", 5, 2, "lunch");

      expect(item.recipeId).toBe(5);
      expect(item.dayOfWeek).toBe(2);
    });

    it("rejects adding a recipe that does not exist", async () => {
      mockedQuery.mockResolvedValueOnce({ rowCount: 0, rows: [] });

      await expect(addItem(10, "2026-07-06", 999, 0, "dinner")).rejects.toThrow(ApiError);
    });
  });

  describe("removeItem", () => {
    it("removes an item owned by the user", async () => {
      mockedQuery.mockResolvedValueOnce({ rowCount: 1 });
      await expect(removeItem(10, 1)).resolves.toBeUndefined();
    });

    it("throws 404 when the item does not belong to the user", async () => {
      mockedQuery.mockResolvedValueOnce({ rowCount: 0 });
      await expect(removeItem(10, 1)).rejects.toThrow(ApiError);
    });
  });

  describe("getShoppingList", () => {
    it("aggregates and deduplicates ingredients across recipes", async () => {
      mockedQuery
        .mockResolvedValueOnce({ rowCount: 1, rows: [planRow] })
        .mockResolvedValueOnce({
          rows: [
            { ingredients: ["Farinha", "Ovo", "Leite"] },
            { ingredients: ["farinha", "Açúcar"] },
          ],
        });

      const list = await getShoppingList(10, "2026-07-06");

      expect(list).toEqual([
        { name: "Açúcar", count: 1 },
        { name: "Farinha", count: 2 },
        { name: "Leite", count: 1 },
        { name: "Ovo", count: 1 },
      ]);
    });
  });
});
