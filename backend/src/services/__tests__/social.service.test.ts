import { pool } from "../../config/db";
import { ApiError } from "../../middleware/errorHandler";
import {
  followUser,
  getUserProfile,
  searchUsers,
  suggestUsers,
  unfollowUser,
} from "../social.service";

jest.mock("../../config/db", () => ({
  pool: { query: jest.fn() },
}));

const mockedQuery = pool.query as jest.Mock;

describe("social.service", () => {
  beforeEach(() => mockedQuery.mockReset());

  describe("searchUsers", () => {
    it("returns matching users with aggregated counts", async () => {
      mockedQuery.mockResolvedValueOnce({
        rows: [
          {
            id: 2,
            name: "Bia",
            avatar_url: null,
            recipe_count: "3",
            follower_count: "1",
            is_following: false,
          },
        ],
      });

      const users = await searchUsers("bia", 1);

      expect(users).toEqual([
        { id: 2, name: "Bia", avatarUrl: null, recipeCount: 3, followerCount: 1, isFollowing: false },
      ]);
    });
  });

  describe("suggestUsers", () => {
    it("ranks users by popularity excluding already-followed", async () => {
      mockedQuery.mockResolvedValueOnce({
        rows: [
          { id: 3, name: "Caio", avatar_url: null, recipe_count: "5", follower_count: "10" },
        ],
      });

      const users = await suggestUsers(1);

      expect(users[0]).toMatchObject({ id: 3, followerCount: 10, isFollowing: false });
    });
  });

  describe("getUserProfile", () => {
    it("throws 404 when the user does not exist", async () => {
      mockedQuery.mockResolvedValueOnce({ rows: [] });
      await expect(getUserProfile(999, 1)).rejects.toThrow(ApiError);
    });

    it("assembles profile data from parallel queries", async () => {
      mockedQuery
        .mockResolvedValueOnce({ rows: [{ id: 2, name: "Bia", avatar_url: null }] })
        .mockResolvedValueOnce({ rows: [{ count: "4" }] })
        .mockResolvedValueOnce({ rows: [{ count: "7" }] })
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [{ id: 3, name: "Caio", avatar_url: null }],
        })
        .mockResolvedValueOnce({ rows: [{ exists: true }] });

      const profile = await getUserProfile(2, 1);

      expect(profile).toMatchObject({
        id: 2,
        name: "Bia",
        recipeCount: 4,
        followerCount: 7,
        followingCount: 1,
        isFollowing: true,
        following: [{ id: 3, name: "Caio", avatarUrl: null }],
      });
    });
  });

  describe("followUser", () => {
    it("rejects following yourself", async () => {
      await expect(followUser(1, 1)).rejects.toThrow(ApiError);
    });

    it("rejects following a user that does not exist", async () => {
      mockedQuery.mockResolvedValueOnce({ rowCount: 0 });
      await expect(followUser(1, 999)).rejects.toThrow(ApiError);
    });

    it("inserts a follow relationship", async () => {
      mockedQuery
        .mockResolvedValueOnce({ rowCount: 1 })
        .mockResolvedValueOnce({ rowCount: 1 });

      await expect(followUser(1, 2)).resolves.toBeUndefined();
    });
  });

  describe("unfollowUser", () => {
    it("deletes the follow relationship", async () => {
      mockedQuery.mockResolvedValueOnce({ rowCount: 1 });
      await expect(unfollowUser(1, 2)).resolves.toBeUndefined();
    });
  });
});
