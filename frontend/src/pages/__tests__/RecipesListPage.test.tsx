import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { listFeed, listRecipes } from "../../api/recipes";
import { AuthProvider } from "../../context/AuthContext";
import { RecipesListPage } from "../RecipesListPage";

vi.mock("../../api/recipes", () => ({
  listRecipes: vi.fn(),
  listFeed: vi.fn(),
}));

function renderPage() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <RecipesListPage />
      </MemoryRouter>
    </AuthProvider>
  );
}

describe("RecipesListPage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(listRecipes).mockReset();
    vi.mocked(listFeed).mockReset();
  });

  it("renders the recipes returned by the API", async () => {
    vi.mocked(listRecipes).mockResolvedValueOnce([
      {
        id: 1,
        authorId: 1,
        title: "Bolo de cenoura",
        description: null,
        category: "sobremesa",
        prepTimeMinutes: 60,
        servings: 8,
        imageUrl: null,
        ingredients: ["cenoura"],
        instructions: ["assar"],
        createdAt: "",
        updatedAt: "",
      },
    ]);

    renderPage();

    expect(await screen.findByText("Bolo de cenoura")).toBeInTheDocument();
  });

  it("shows an empty state when there are no recipes", async () => {
    vi.mocked(listRecipes).mockResolvedValueOnce([]);
    renderPage();

    await waitFor(() =>
      expect(screen.getByText("Nenhuma receita encontrada.")).toBeInTheDocument()
    );
  });

  it("shows tabs and defaults to the feed when authenticated", async () => {
    localStorage.setItem("gestao-receitas:token", "abc");
    localStorage.setItem(
      "gestao-receitas:user",
      JSON.stringify({ id: 1, name: "Ana", email: "ana@test.com", avatarUrl: null })
    );
    vi.mocked(listFeed).mockResolvedValueOnce([]);

    renderPage();

    await waitFor(() => expect(listFeed).toHaveBeenCalled());
    expect(screen.getByRole("button", { name: "Minhas receitas" })).toBeInTheDocument();
  });

  it("switches to the explore tab and fetches the general catalog", async () => {
    localStorage.setItem("gestao-receitas:token", "abc");
    localStorage.setItem(
      "gestao-receitas:user",
      JSON.stringify({ id: 1, name: "Ana", email: "ana@test.com", avatarUrl: null })
    );
    vi.mocked(listFeed).mockResolvedValueOnce([]);
    vi.mocked(listRecipes).mockResolvedValueOnce([]);

    renderPage();
    await waitFor(() => expect(listFeed).toHaveBeenCalled());

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Explorar" }));

    await waitFor(() => expect(listRecipes).toHaveBeenCalled());
  });
});
