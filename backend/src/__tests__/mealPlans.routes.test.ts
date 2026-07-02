import request from "supertest";
import { pool } from "../config/db";
import { signToken } from "../utils/jwt";

jest.mock("../config/db", () => ({
  pool: { query: jest.fn() },
}));

jest.mock("../config/passport", () => {
  const passport = jest.requireActual("passport");
  return { __esModule: true, default: passport };
});

import app from "../app";

const mockedQuery = pool.query as jest.Mock;
const token = signToken({ userId: 10 });
const planRow = { id: 1, user_id: 10, week_start_date: "2026-07-06" };

describe("meal plans routes", () => {
  beforeEach(() => mockedQuery.mockReset());

  it("requires authentication", async () => {
    const res = await request(app).get("/api/meal-plans?weekStart=2026-07-06");
    expect(res.status).toBe(401);
  });

  it("GET /api/meal-plans returns the week plan", async () => {
    mockedQuery
      .mockResolvedValueOnce({ rowCount: 1, rows: [planRow] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get("/api/meal-plans?weekStart=2026-07-06")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.plan.weekStartDate).toBe("2026-07-06");
  });

  it("GET /api/meal-plans rejects an invalid weekStart", async () => {
    const res = await request(app)
      .get("/api/meal-plans?weekStart=not-a-date")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it("POST /api/meal-plans/items adds a recipe to the plan", async () => {
    mockedQuery
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 5 }] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [planRow] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            meal_plan_id: 1,
            recipe_id: 5,
            day_of_week: 3,
            meal_type: "dinner",
            title: "Bolo",
            image_url: null,
          },
        ],
      });

    const res = await request(app)
      .post("/api/meal-plans/items")
      .set("Authorization", `Bearer ${token}`)
      .send({ weekStartDate: "2026-07-06", recipeId: 5, dayOfWeek: 3 });

    expect(res.status).toBe(201);
    expect(res.body.item.recipeId).toBe(5);
  });

  it("POST /api/meal-plans/items rejects an out-of-range dayOfWeek", async () => {
    const res = await request(app)
      .post("/api/meal-plans/items")
      .set("Authorization", `Bearer ${token}`)
      .send({ weekStartDate: "2026-07-06", recipeId: 5, dayOfWeek: 9 });

    expect(res.status).toBe(400);
  });

  it("DELETE /api/meal-plans/items/:id removes an owned item", async () => {
    mockedQuery.mockResolvedValueOnce({ rowCount: 1 });

    const res = await request(app)
      .delete("/api/meal-plans/items/1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  it("DELETE /api/meal-plans/items/:id returns 404 for an item not owned", async () => {
    mockedQuery.mockResolvedValueOnce({ rowCount: 0 });

    const res = await request(app)
      .delete("/api/meal-plans/items/999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it("GET /api/meal-plans/shopping-list aggregates ingredients", async () => {
    mockedQuery
      .mockResolvedValueOnce({ rowCount: 1, rows: [planRow] })
      .mockResolvedValueOnce({ rows: [{ ingredients: ["Farinha", "Ovo"] }] });

    const res = await request(app)
      .get("/api/meal-plans/shopping-list?weekStart=2026-07-06")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.ingredients).toEqual([
      { name: "Farinha", count: 1 },
      { name: "Ovo", count: 1 },
    ]);
  });
});
