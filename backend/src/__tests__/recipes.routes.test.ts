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

jest.mock("../services/upload.service", () => ({
  uploadImageBuffer: jest.fn().mockResolvedValue("https://cloudinary.test/image.jpg"),
}));

import app from "../app";

const mockedQuery = pool.query as jest.Mock;
const token = signToken({ userId: 10 });

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

describe("recipes routes", () => {
  beforeEach(() => mockedQuery.mockReset());

  it("GET /api/recipes lists recipes without auth", async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [baseRecipeRow] });

    const res = await request(app).get("/api/recipes");

    expect(res.status).toBe(200);
    expect(res.body.recipes).toHaveLength(1);
  });

  it("GET /api/recipes/:id returns 404 for unknown recipe", async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get("/api/recipes/999");
    expect(res.status).toBe(404);
  });

  it("POST /api/recipes requires authentication", async () => {
    const res = await request(app)
      .post("/api/recipes")
      .field("title", "Bolo")
      .field("ingredients", JSON.stringify(["cenoura"]))
      .field("instructions", JSON.stringify(["assar"]));

    expect(res.status).toBe(401);
  });

  it("POST /api/recipes creates a recipe with an uploaded image", async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [{ ...baseRecipeRow, image_url: "https://cloudinary.test/image.jpg" }],
    });

    const res = await request(app)
      .post("/api/recipes")
      .set("Authorization", `Bearer ${token}`)
      .field("title", "Bolo de cenoura")
      .field("category", "sobremesa")
      .field("ingredients", JSON.stringify(["cenoura", "farinha"]))
      .field("instructions", JSON.stringify(["misturar", "assar"]))
      .attach("image", Buffer.from("fake-image-bytes"), {
        filename: "bolo.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(201);
    expect(res.body.recipe.imageUrl).toBe("https://cloudinary.test/image.jpg");
  });

  it("POST /api/recipes rejects non-image files", async () => {
    const res = await request(app)
      .post("/api/recipes")
      .set("Authorization", `Bearer ${token}`)
      .field("title", "Bolo de cenoura")
      .field("ingredients", JSON.stringify(["cenoura"]))
      .field("instructions", JSON.stringify(["assar"]))
      .attach("image", Buffer.from("not-an-image"), {
        filename: "bolo.txt",
        contentType: "text/plain",
      });

    expect(res.status).toBe(400);
  });

  it("POST /api/recipes rejects invalid payloads", async () => {
    const res = await request(app)
      .post("/api/recipes")
      .set("Authorization", `Bearer ${token}`)
      .field("title", "a")
      .field("ingredients", JSON.stringify([]))
      .field("instructions", JSON.stringify([]));

    expect(res.status).toBe(400);
  });

  it("DELETE /api/recipes/:id forbids a non-owner", async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ author_id: 999 }] });

    const res = await request(app)
      .delete("/api/recipes/1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it("DELETE /api/recipes/:id succeeds for the owner", async () => {
    mockedQuery
      .mockResolvedValueOnce({ rows: [{ author_id: 10 }] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .delete("/api/recipes/1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  it("POST /api/recipes/:id/favorite requires authentication", async () => {
    const res = await request(app).post("/api/recipes/1/favorite");
    expect(res.status).toBe(401);
  });

  it("POST /api/recipes/:id/favorite favorites an existing recipe", async () => {
    mockedQuery
      .mockResolvedValueOnce({ rows: [baseRecipeRow] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post("/api/recipes/1/favorite")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  it("GET /api/recipes/favorites returns the caller's favorites", async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [baseRecipeRow] });

    const res = await request(app)
      .get("/api/recipes/favorites")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.recipes).toHaveLength(1);
  });

  it("GET /api/recipes/feed requires authentication", async () => {
    const res = await request(app).get("/api/recipes/feed");
    expect(res.status).toBe(401);
  });

  it("GET /api/recipes/feed returns recipes from followed authors", async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [baseRecipeRow] });

    const res = await request(app)
      .get("/api/recipes/feed")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.recipes).toHaveLength(1);
  });
});
