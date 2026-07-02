import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { listRecipes } from "../../api/recipes";
import { followUser, getUserProfile, unfollowUser } from "../../api/social";
import { AuthProvider } from "../../context/AuthContext";
import { UserProfilePage } from "../UserProfilePage";

vi.mock("../../api/social", () => ({
  getUserProfile: vi.fn(),
  followUser: vi.fn(),
  unfollowUser: vi.fn(),
}));

vi.mock("../../api/recipes", () => ({
  listRecipes: vi.fn(),
}));

const profile = {
  id: 2,
  name: "Bia",
  avatarUrl: null,
  recipeCount: 2,
  followerCount: 5,
  followingCount: 1,
  isFollowing: false,
  following: [{ id: 3, name: "Caio", avatarUrl: null }],
};

function renderPage() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={["/users/2"]}>
        <Routes>
          <Route path="/users/:id" element={<UserProfilePage />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe("UserProfilePage", () => {
  beforeEach(() => {
    vi.mocked(getUserProfile).mockReset();
    vi.mocked(listRecipes).mockReset();
    vi.mocked(followUser).mockReset();
    vi.mocked(unfollowUser).mockReset();
    vi.mocked(listRecipes).mockResolvedValue([]);
  });

  it("renders profile stats and following list", async () => {
    vi.mocked(getUserProfile).mockResolvedValueOnce(profile);
    renderPage();

    expect(await screen.findByText("Bia")).toBeInTheDocument();
    expect(screen.getByText("2 receitas · 5 seguidores · 1 seguindo")).toBeInTheDocument();
    expect(screen.getByText("Caio")).toBeInTheDocument();
  });

  it("follows the profile owner when clicking the follow button", async () => {
    vi.mocked(getUserProfile).mockResolvedValueOnce(profile);
    vi.mocked(followUser).mockResolvedValueOnce(undefined);

    renderPage();
    const user = userEvent.setup();

    const followButton = await screen.findByRole("button", { name: "Seguir" });
    await user.click(followButton);

    await waitFor(() => expect(followUser).toHaveBeenCalledWith(2));
    expect(await screen.findByRole("button", { name: "Deixar de seguir" })).toBeInTheDocument();
  });
});
