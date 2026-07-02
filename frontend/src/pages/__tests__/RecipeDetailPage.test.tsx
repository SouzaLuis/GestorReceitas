import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { favoriteRecipe, getRecipe, unfavoriteRecipe } from "../../api/recipes";
import { AuthProvider } from "../../context/AuthContext";
import { RecipeDetailPage } from "../RecipeDetailPage";

vi.mock("../../api/recipes", () => ({
  getRecipe: vi.fn(),
  favoriteRecipe: vi.fn(),
  unfavoriteRecipe: vi.fn(),
  deleteRecipe: vi.fn(),
}));

const recipe = {
  id: 1,
  authorId: 2,
  title: "Bolo de cenoura",
  description: "Delicioso",
  category: "sobremesa",
  prepTimeMinutes: 60,
  servings: 8,
  imageUrl: null,
  ingredients: ["cenoura", "farinha"],
  instructions: ["misturar", "assar"],
  createdAt: "",
  updatedAt: "",
};

function renderPage() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={["/recipes/1"]}>
        <Routes>
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe("RecipeDetailPage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(getRecipe).mockReset();
    vi.mocked(favoriteRecipe).mockReset();
    vi.mocked(unfavoriteRecipe).mockReset();
  });

  it("renders the recipe details", async () => {
    vi.mocked(getRecipe).mockResolvedValueOnce(recipe);
    renderPage();

    expect(await screen.findByText("Bolo de cenoura")).toBeInTheDocument();
    expect(screen.getByText("cenoura")).toBeInTheDocument();
    expect(screen.getByText("misturar")).toBeInTheDocument();
  });

  it("shows an error message when the recipe is not found", async () => {
    vi.mocked(getRecipe).mockRejectedValueOnce(new Error("not found"));
    renderPage();

    expect(await screen.findByRole("alert")).toHaveTextContent("Receita não encontrada.");
  });

  it("toggles favorite state when authenticated", async () => {
    localStorage.setItem("gestao-receitas:token", "abc");
    vi.mocked(getRecipe).mockResolvedValueOnce(recipe);
    vi.mocked(favoriteRecipe).mockResolvedValueOnce(undefined);

    renderPage();
    const user = userEvent.setup();

    const favoriteButton = await screen.findByRole("button", { name: /favoritar/i });
    await user.click(favoriteButton);

    await waitFor(() => expect(favoriteRecipe).toHaveBeenCalledWith(1));
    expect(await screen.findByRole("button", { name: /remover dos favoritos/i })).toBeInTheDocument();
  });
});
