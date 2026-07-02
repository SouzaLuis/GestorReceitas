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

describe("GET /api/me", () => {
  it("returns 401 without a token", async () => {
    const res = await request(app).get("/api/me");
    expect(res.status).toBe(401);
  });

  it("returns 401 with an invalid token", async () => {
    const res = await request(app).get("/api/me").set("Authorization", "Bearer invalid-token");
    expect(res.status).toBe(401);
  });

  it("returns the current user for a valid token", async () => {
    const token = signToken({ userId: 1 });
    mockedQuery.mockResolvedValueOnce({
      rows: [{ id: 1, name: "Ana", email: "ana@test.com", avatar_url: null }],
    });

    const res = await request(app).get("/api/me").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({
      id: 1,
      name: "Ana",
      email: "ana@test.com",
      avatarUrl: null,
    });
  });

  it("returns 404 when the user no longer exists", async () => {
    const token = signToken({ userId: 999 });
    mockedQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get("/api/me").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
