import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { followUser, searchUsers, suggestUsers, unfollowUser } from "../../api/social";
import { AuthProvider } from "../../context/AuthContext";
import { UserSearchPage } from "../UserSearchPage";

vi.mock("../../api/social", () => ({
  searchUsers: vi.fn(),
  suggestUsers: vi.fn(),
  followUser: vi.fn(),
  unfollowUser: vi.fn(),
}));

const bia = {
  id: 2,
  name: "Bia",
  avatarUrl: null,
  recipeCount: 3,
  followerCount: 1,
  isFollowing: false,
};

function renderPage() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <UserSearchPage />
      </MemoryRouter>
    </AuthProvider>
  );
}

describe("UserSearchPage", () => {
  beforeEach(() => {
    vi.mocked(searchUsers).mockReset();
    vi.mocked(suggestUsers).mockReset();
    vi.mocked(followUser).mockReset();
    vi.mocked(unfollowUser).mockReset();
    vi.mocked(suggestUsers).mockResolvedValue([]);
  });

  it("loads suggestions on mount", async () => {
    vi.mocked(suggestUsers).mockResolvedValueOnce([bia]);
    renderPage();

    expect(await screen.findByText("Bia")).toBeInTheDocument();
  });

  it("searches for users and toggles follow state", async () => {
    vi.mocked(searchUsers).mockResolvedValueOnce([bia]);
    vi.mocked(followUser).mockResolvedValueOnce(undefined);

    renderPage();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/nome ou email/i), "bia");
    await user.click(screen.getByRole("button", { name: "Buscar" }));

    expect(await screen.findByText("Bia")).toBeInTheDocument();

    const followButtons = await screen.findAllByRole("button", { name: "Seguir" });
    await user.click(followButtons[0]);

    await waitFor(() => expect(followUser).toHaveBeenCalledWith(2));
    expect(await screen.findAllByRole("button", { name: "Deixar de seguir" })).not.toHaveLength(0);
  });
});
