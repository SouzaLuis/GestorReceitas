import bcrypt from "bcrypt";
import { pool } from "../../config/db";
import { ApiError } from "../../middleware/errorHandler";
import { findOrCreateGoogleUser, loginUser, registerUser } from "../auth.service";

jest.mock("../../config/db", () => ({
  pool: { query: jest.fn() },
}));

const mockedQuery = pool.query as jest.Mock;

describe("auth.service", () => {
  describe("registerUser", () => {
    it("creates a new user and returns a token", async () => {
      mockedQuery
        .mockResolvedValueOnce({ rowCount: 0, rows: [] })
        .mockResolvedValueOnce({
          rows: [{ id: 1, name: "Ana", email: "ana@test.com", avatar_url: null }],
        });

      const result = await registerUser("Ana", "ana@test.com", "password123");

      expect(result.user).toEqual({
        id: 1,
        name: "Ana",
        email: "ana@test.com",
        avatarUrl: null,
      });
      expect(typeof result.token).toBe("string");
    });

    it("rejects duplicate emails", async () => {
      mockedQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1 }] });

      await expect(registerUser("Ana", "ana@test.com", "password123")).rejects.toThrow(
        ApiError
      );
    });
  });

  describe("loginUser", () => {
    it("logs in with correct credentials", async () => {
      const passwordHash = await bcrypt.hash("password123", 4);
      mockedQuery.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            name: "Ana",
            email: "ana@test.com",
            password_hash: passwordHash,
            avatar_url: null,
          },
        ],
      });

      const result = await loginUser("ana@test.com", "password123");
      expect(result.user.email).toBe("ana@test.com");
      expect(typeof result.token).toBe("string");
    });

    it("rejects wrong password", async () => {
      const passwordHash = await bcrypt.hash("password123", 4);
      mockedQuery.mockResolvedValueOnce({
        rows: [{ id: 1, email: "ana@test.com", password_hash: passwordHash }],
      });

      await expect(loginUser("ana@test.com", "wrong-password")).rejects.toThrow(ApiError);
    });

    it("rejects unknown email", async () => {
      mockedQuery.mockResolvedValueOnce({ rows: [] });

      await expect(loginUser("nobody@test.com", "password123")).rejects.toThrow(ApiError);
    });

    it("rejects google-only accounts trying password login", async () => {
      mockedQuery.mockResolvedValueOnce({
        rows: [{ id: 1, email: "ana@test.com", password_hash: null }],
      });

      await expect(loginUser("ana@test.com", "password123")).rejects.toThrow(ApiError);
    });
  });

  describe("findOrCreateGoogleUser", () => {
    it("creates a user when none exists", async () => {
      mockedQuery
        .mockResolvedValueOnce({ rowCount: 0, rows: [] })
        .mockResolvedValueOnce({
          rows: [{ id: 2, name: "Bia", email: "bia@test.com", google_id: "g-1" }],
        });

      const user = await findOrCreateGoogleUser({
        googleId: "g-1",
        email: "bia@test.com",
        name: "Bia",
      });

      expect(user.id).toBe(2);
    });

    it("links google_id to an existing email-based account", async () => {
      mockedQuery
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [{ id: 3, email: "bia@test.com", google_id: null }],
        })
        .mockResolvedValueOnce({ rowCount: 1, rows: [] });

      const user = await findOrCreateGoogleUser({
        googleId: "g-1",
        email: "bia@test.com",
        name: "Bia",
      });

      expect(user.id).toBe(3);
      expect(mockedQuery).toHaveBeenCalledWith(
        "UPDATE users SET google_id = $1 WHERE id = $2",
        ["g-1", 3]
      );
    });

    it("returns the existing user untouched when google_id is already set", async () => {
      mockedQuery.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ id: 4, email: "bia@test.com", google_id: "g-1" }],
      });

      const user = await findOrCreateGoogleUser({
        googleId: "g-1",
        email: "bia@test.com",
        name: "Bia",
      });

      expect(user.id).toBe(4);
      expect(mockedQuery).toHaveBeenCalledTimes(1);
    });
  });
});
