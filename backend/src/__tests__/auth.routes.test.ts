import request from "supertest";
import { pool } from "../config/db";

jest.mock("../config/db", () => ({
  pool: { query: jest.fn() },
}));

jest.mock("../config/passport", () => {
  const passport = jest.requireActual("passport");
  return { __esModule: true, default: passport };
});

import app from "../app";

const mockedQuery = pool.query as jest.Mock;

describe("POST /api/auth/register", () => {
  it("returns 201 and a token for valid input", async () => {
    mockedQuery
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce({
        rows: [{ id: 1, name: "Ana", email: "ana@test.com", avatar_url: null }],
      });

    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Ana", email: "ana@test.com", password: "password123" });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("ana@test.com");
  });

  it("returns 400 for invalid email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Ana", email: "not-an-email", password: "password123" });

    expect(res.status).toBe(400);
  });

  it("returns 400 for short password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Ana", email: "ana@test.com", password: "123" });

    expect(res.status).toBe(400);
  });

  it("returns 409 for duplicate email", async () => {
    mockedQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1 }] });

    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Ana", email: "ana@test.com", password: "password123" });

    expect(res.status).toBe(409);
  });
});

describe("POST /api/auth/login", () => {
  it("returns 401 for unknown user", async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@test.com", password: "password123" });

    expect(res.status).toBe(401);
  });

  it("returns 400 when body is missing fields", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "ana@test.com" });
    expect(res.status).toBe(400);
  });
});

describe("GET /health", () => {
  it("returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
