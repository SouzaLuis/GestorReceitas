import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addMealPlanItem, getWeekPlan, removeMealPlanItem } from "../../api/mealPlans";
import { listRecipes } from "../../api/recipes";
import { AuthProvider } from "../../context/AuthContext";
import { MealPlanPage } from "../MealPlanPage";

vi.mock("../../api/mealPlans", () => ({
  getWeekPlan: vi.fn(),
  addMealPlanItem: vi.fn(),
  removeMealPlanItem: vi.fn(),
}));

vi.mock("../../api/recipes", () => ({
  listRecipes: vi.fn(),
}));

const recipe = {
  id: 5,
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
};

function renderPage() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <MealPlanPage />
      </MemoryRouter>
    </AuthProvider>
  );
}

describe("MealPlanPage", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-07-01T12:00:00"));
    vi.mocked(listRecipes).mockReset();
    vi.mocked(getWeekPlan).mockReset();
    vi.mocked(addMealPlanItem).mockReset();
    vi.mocked(removeMealPlanItem).mockReset();
    vi.mocked(listRecipes).mockResolvedValue([recipe]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the seven weekday columns", async () => {
    vi.mocked(getWeekPlan).mockResolvedValue({ id: 1, weekStartDate: "2026-06-29", items: [] });
    renderPage();

    expect(await screen.findByText("Segunda")).toBeInTheDocument();
    expect(screen.getByText("Domingo")).toBeInTheDocument();
  });

  it("shows planned items for the correct day", async () => {
    vi.mocked(getWeekPlan).mockResolvedValue({
      id: 1,
      weekStartDate: "2026-06-29",
      items: [
        {
          id: 1,
          mealPlanId: 1,
          recipeId: 5,
          dayOfWeek: 0,
          mealType: "dinner",
          recipeTitle: "Bolo de cenoura",
          recipeImageUrl: null,
        },
      ],
    });

    renderPage();

    await waitFor(() => {
      const item = document.querySelector(".day-column__items strong");
      expect(item?.textContent).toBe("Bolo de cenoura");
    });
  });

  it("adds a recipe to a day and refreshes the plan", async () => {
    vi.mocked(getWeekPlan).mockResolvedValue({ id: 1, weekStartDate: "2026-06-29", items: [] });
    vi.mocked(addMealPlanItem).mockResolvedValueOnce(undefined);

    renderPage();
    const user = userEvent.setup();

    const selects = await screen.findAllByRole("combobox");
    await user.selectOptions(selects[0], "5");
    const addButtons = screen.getAllByRole("button", { name: "Adicionar" });
    await user.click(addButtons[0]);

    await waitFor(() =>
      expect(addMealPlanItem).toHaveBeenCalledWith({
        weekStartDate: "2026-06-29",
        recipeId: 5,
        dayOfWeek: 0,
        mealType: "dinner",
      })
    );
  });
});
