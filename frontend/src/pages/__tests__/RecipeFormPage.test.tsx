import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRecipe } from "../../api/recipes";
import { AuthProvider } from "../../context/AuthContext";
import { RecipeFormPage } from "../RecipeFormPage";

vi.mock("../../api/recipes", () => ({
  createRecipe: vi.fn(),
  updateRecipe: vi.fn(),
  getRecipe: vi.fn(),
}));

function renderPage() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={["/recipes/new"]}>
        <RecipeFormPage />
      </MemoryRouter>
    </AuthProvider>
  );
}

describe("RecipeFormPage", () => {
  beforeEach(() => {
    vi.mocked(createRecipe).mockReset();
  });

  it("submits the form with the entered values", async () => {
    vi.mocked(createRecipe).mockResolvedValueOnce({
      id: 1,
      authorId: 1,
      title: "Bolo de cenoura",
      description: null,
      category: null,
      prepTimeMinutes: null,
      servings: null,
      imageUrl: null,
      ingredients: ["cenoura"],
      instructions: ["assar"],
      createdAt: "",
      updatedAt: "",
    });

    renderPage();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/título/i), "Bolo de cenoura");
    await user.type(screen.getByLabelText(/ingredientes/i), "cenoura{Enter}farinha{Enter}");
    await user.type(screen.getByLabelText(/modo de preparo/i), "misturar{Enter}assar");
    await user.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => expect(createRecipe).toHaveBeenCalled());
    expect(vi.mocked(createRecipe).mock.calls[0][0]).toMatchObject({
      title: "Bolo de cenoura",
      ingredients: ["cenoura", "farinha"],
      instructions: "misturar\nassar",
    });
  });

  it("adds an item on Enter and removes it when clicking the remove button", async () => {
    renderPage();
    const user = userEvent.setup();

    const ingredientsInput = screen.getByLabelText(/ingredientes/i);
    await user.type(ingredientsInput, "cenoura{Enter}");

    expect(screen.getByText("cenoura")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /remover cenoura/i }));
    expect(screen.queryByText("cenoura")).not.toBeInTheDocument();
  });

  it("blocks submit when there are no ingredients or steps", async () => {
    renderPage();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/título/i), "Bolo de cenoura");
    await user.click(screen.getByRole("button", { name: /salvar/i }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(createRecipe).not.toHaveBeenCalled();
  });
});
