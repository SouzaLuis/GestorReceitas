import { pool } from "../config/db";
import { ApiError } from "../middleware/errorHandler";

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

async function assertUserExists(userId: number) {
  const result = await pool.query("SELECT id FROM users WHERE id = $1", [userId]);
  if (!result.rowCount) {
    throw new ApiError(404, "User not found");
  }
}

export async function searchUsers(
  query: string,
  currentUserId: number
): Promise<UserSearchResult[]> {
  const result = await pool.query<{
    id: number;
    name: string;
    avatar_url: string | null;
    recipe_count: string;
    follower_count: string;
    is_following: boolean;
  }>(
    `SELECT
       u.id,
       u.name,
       u.avatar_url,
       COUNT(DISTINCT r.id) AS recipe_count,
       COUNT(DISTINCT f.follower_id) AS follower_count,
       EXISTS(
         SELECT 1 FROM follows
         WHERE follower_id = $2 AND followed_id = u.id
       ) AS is_following
     FROM users u
     LEFT JOIN recipes r ON r.author_id = u.id
     LEFT JOIN follows f ON f.followed_id = u.id
     WHERE u.id <> $2 AND (u.name ILIKE $1 OR u.email ILIKE $1)
     GROUP BY u.id
     ORDER BY u.name
     LIMIT 20`,
    [`%${query}%`, currentUserId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    avatarUrl: row.avatar_url,
    recipeCount: Number(row.recipe_count),
    followerCount: Number(row.follower_count),
    isFollowing: row.is_following,
  }));
}

export async function suggestUsers(
  currentUserId: number,
  limit = 10
): Promise<UserSearchResult[]> {
  const result = await pool.query<{
    id: number;
    name: string;
    avatar_url: string | null;
    recipe_count: string;
    follower_count: string;
  }>(
    `SELECT
       u.id,
       u.name,
       u.avatar_url,
       COUNT(DISTINCT r.id) AS recipe_count,
       COUNT(DISTINCT f.follower_id) AS follower_count
     FROM users u
     LEFT JOIN recipes r ON r.author_id = u.id
     LEFT JOIN follows f ON f.followed_id = u.id
     WHERE u.id <> $1
       AND NOT EXISTS(
         SELECT 1 FROM follows WHERE follower_id = $1 AND followed_id = u.id
       )
     GROUP BY u.id
     ORDER BY follower_count DESC, recipe_count DESC, u.name
     LIMIT $2`,
    [currentUserId, limit]
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    avatarUrl: row.avatar_url,
    recipeCount: Number(row.recipe_count),
    followerCount: Number(row.follower_count),
    isFollowing: false,
  }));
}

export async function getUserProfile(
  userId: number,
  viewerId: number | null
): Promise<UserProfile> {
  const userResult = await pool.query<{ id: number; name: string; avatar_url: string | null }>(
    "SELECT id, name, avatar_url FROM users WHERE id = $1",
    [userId]
  );
  const user = userResult.rows[0];
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const [recipeCountResult, followerCountResult, followingResult, isFollowingResult] =
    await Promise.all([
      pool.query<{ count: string }>("SELECT COUNT(*) FROM recipes WHERE author_id = $1", [
        userId,
      ]),
      pool.query<{ count: string }>("SELECT COUNT(*) FROM follows WHERE followed_id = $1", [
        userId,
      ]),
      pool.query<{ id: number; name: string; avatar_url: string | null }>(
        `SELECT u.id, u.name, u.avatar_url
         FROM follows f
         INNER JOIN users u ON u.id = f.followed_id
         WHERE f.follower_id = $1
         ORDER BY u.name`,
        [userId]
      ),
      viewerId
        ? pool.query<{ exists: boolean }>(
            "SELECT EXISTS(SELECT 1 FROM follows WHERE follower_id = $1 AND followed_id = $2)",
            [viewerId, userId]
          )
        : Promise.resolve({ rows: [{ exists: false }] }),
    ]);

  return {
    id: user.id,
    name: user.name,
    avatarUrl: user.avatar_url,
    recipeCount: Number(recipeCountResult.rows[0].count),
    followerCount: Number(followerCountResult.rows[0].count),
    followingCount: followingResult.rowCount ?? 0,
    isFollowing: isFollowingResult.rows[0].exists,
    following: followingResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      avatarUrl: row.avatar_url,
    })),
  };
}

export async function followUser(followerId: number, followedId: number) {
  if (followerId === followedId) {
    throw new ApiError(400, "You cannot follow yourself");
  }
  await assertUserExists(followedId);
  await pool.query(
    `INSERT INTO follows (follower_id, followed_id) VALUES ($1, $2)
     ON CONFLICT (follower_id, followed_id) DO NOTHING`,
    [followerId, followedId]
  );
}

export async function unfollowUser(followerId: number, followedId: number) {
  await pool.query("DELETE FROM follows WHERE follower_id = $1 AND followed_id = $2", [
    followerId,
    followedId,
  ]);
}
