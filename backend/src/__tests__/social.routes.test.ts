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
const token = signToken({ userId: 1 });

describe("social routes", () => {
  beforeEach(() => mockedQuery.mockReset());

  it("requires authentication for search", async () => {
    const res = await request(app).get("/api/users/search?q=bia");
    expect(res.status).toBe(401);
  });

  it("GET /api/users/search returns matches", async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 2,
          name: "Bia",
          avatar_url: null,
          recipe_count: "1",
          follower_count: "0",
          is_following: false,
        },
      ],
    });

    const res = await request(app)
      .get("/api/users/search?q=bia")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(1);
  });

  it("GET /api/users/search rejects an empty query", async () => {
    const res = await request(app)
      .get("/api/users/search?q=")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it("GET /api/users/suggestions returns ranked users", async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [{ id: 3, name: "Caio", avatar_url: null, recipe_count: "2", follower_count: "5" }],
    });

    const res = await request(app)
      .get("/api/users/suggestions")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.users[0].id).toBe(3);
  });

  it("GET /api/users/:id returns 404 for an unknown user", async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get("/api/users/999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it("POST /api/users/:id/follow rejects following yourself", async () => {
    const res = await request(app)
      .post("/api/users/1/follow")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it("POST /api/users/:id/follow follows another user", async () => {
    mockedQuery
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockResolvedValueOnce({ rowCount: 1 });

    const res = await request(app)
      .post("/api/users/2/follow")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  it("DELETE /api/users/:id/follow unfollows a user", async () => {
    mockedQuery.mockResolvedValueOnce({ rowCount: 1 });

    const res = await request(app)
      .delete("/api/users/2/follow")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
  });
});
