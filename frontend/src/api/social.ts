import { apiClient } from "./client";
import type { UserProfile, UserSearchResult } from "../types";

export async function searchUsers(query: string): Promise<UserSearchResult[]> {
  const { data } = await apiClient.get<{ users: UserSearchResult[] }>("/api/users/search", {
    params: { q: query },
  });
  return data.users;
}

export async function suggestUsers(): Promise<UserSearchResult[]> {
  const { data } = await apiClient.get<{ users: UserSearchResult[] }>("/api/users/suggestions");
  return data.users;
}

export async function getUserProfile(id: number): Promise<UserProfile> {
  const { data } = await apiClient.get<{ user: UserProfile }>(`/api/users/${id}`);
  return data.user;
}

export async function followUser(id: number): Promise<void> {
  await apiClient.post(`/api/users/${id}/follow`);
}

export async function unfollowUser(id: number): Promise<void> {
  await apiClient.delete(`/api/users/${id}/follow`);
}
