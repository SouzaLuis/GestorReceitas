import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getShoppingList } from "../../api/mealPlans";
import { AuthProvider } from "../../context/AuthContext";
import { ShoppingListPage } from "../ShoppingListPage";

vi.mock("../../api/mealPlans", () => ({
  getShoppingList: vi.fn(),
}));

function renderPage(initialPath: string) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/shopping-list" element={<ShoppingListPage />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe("ShoppingListPage", () => {
  beforeEach(() => vi.mocked(getShoppingList).mockReset());

  it("renders the aggregated ingredients for the given week", async () => {
    vi.mocked(getShoppingList).mockResolvedValueOnce([
      { name: "Farinha", count: 2 },
      { name: "Ovo", count: 1 },
    ]);

    renderPage("/shopping-list?weekStart=2026-06-29");

    expect(await screen.findByText("Farinha")).toBeInTheDocument();
    expect(screen.getByText("×2")).toBeInTheDocument();
    expect(getShoppingList).toHaveBeenCalledWith("2026-06-29");
  });

  it("shows an empty state when there are no ingredients", async () => {
    vi.mocked(getShoppingList).mockResolvedValueOnce([]);
    renderPage("/shopping-list?weekStart=2026-06-29");

    await waitFor(() =>
      expect(
        screen.getByText("Nenhum item ainda. Adicione receitas ao planejamento desta semana.")
      ).toBeInTheDocument()
    );
  });
});
