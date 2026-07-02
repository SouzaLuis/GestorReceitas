import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { addMealPlanItem, getWeekPlan, removeMealPlanItem } from "../api/mealPlans";
import { listRecipes } from "../api/recipes";
import { addDays, getMonday, MEAL_TYPE_LABELS, toISODate, WEEKDAY_LABELS } from "../utils/date";
import type { MealPlan, MealType, Recipe } from "../types";

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export function MealPlanPage() {
  const [weekStart, setWeekStart] = useState(() => toISODate(getMonday(new Date())));
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listRecipes().then(setRecipes).catch(() => setError("Não foi possível carregar as receitas."));
  }, []);

  useEffect(() => {
    setLoading(true);
    getWeekPlan(weekStart)
      .then(setPlan)
      .catch(() => setError("Não foi possível carregar o planejamento."))
      .finally(() => setLoading(false));
  }, [weekStart]);

  async function handleAddItem(dayOfWeek: number, recipeId: number, mealType: MealType) {
    try {
      await addMealPlanItem({ weekStartDate: weekStart, recipeId, dayOfWeek, mealType });
      const updated = await getWeekPlan(weekStart);
      setPlan(updated);
    } catch {
      setError("Não foi possível adicionar a receita ao planejamento.");
    }
  }

  async function handleRemoveItem(itemId: number) {
    try {
      await removeMealPlanItem(itemId);
      setPlan((prev) => (prev ? { ...prev, items: prev.items.filter((i) => i.id !== itemId) } : prev));
    } catch {
      setError("Não foi possível remover o item.");
    }
  }

  const weekEnd = addDays(weekStart, 6);

  return (
    <main className="page">
      <h1>Planejamento semanal</h1>
      <p>
        Semana de {weekStart} a {weekEnd}
      </p>

      <div className="button-row">
        <button type="button" className="secondary" onClick={() => setWeekStart(addDays(weekStart, -7))}>
          ← Semana anterior
        </button>
        <button type="button" className="secondary" onClick={() => setWeekStart(addDays(weekStart, 7))}>
          Próxima semana →
        </button>
        <Link to={`/shopping-list?weekStart=${weekStart}`}>
          <button type="button">Ver lista de compras</button>
        </Link>
      </div>

      {error && <p role="alert">{error}</p>}

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="week-grid">
          {WEEKDAY_LABELS.map((label, dayOfWeek) => (
            <DayColumn
              key={dayOfWeek}
              label={label}
              date={addDays(weekStart, dayOfWeek)}
              items={plan?.items.filter((item) => item.dayOfWeek === dayOfWeek) ?? []}
              recipes={recipes}
              onAddItem={(recipeId, mealType) => handleAddItem(dayOfWeek, recipeId, mealType)}
              onRemoveItem={handleRemoveItem}
            />
          ))}
        </div>
      )}
    </main>
  );
}

function DayColumn({
  label,
  date,
  items,
  recipes,
  onAddItem,
  onRemoveItem,
}: {
  label: string;
  date: string;
  items: MealPlan["items"];
  recipes: Recipe[];
  onAddItem: (recipeId: number, mealType: MealType) => void;
  onRemoveItem: (itemId: number) => void;
}) {
  const [recipeId, setRecipeId] = useState("");
  const [mealType, setMealType] = useState<MealType>("dinner");

  function handleAdd() {
    if (!recipeId) return;
    onAddItem(Number(recipeId), mealType);
    setRecipeId("");
  }

  return (
    <div className="day-column card">
      <h2>{label}</h2>
      <p>{date}</p>

      <ul className="day-column__items">
        {items.map((item) => (
          <li key={item.id}>
            <div>
              <strong>{item.recipeTitle}</strong>
              <span className="badge">{MEAL_TYPE_LABELS[item.mealType]}</span>
            </div>
            <button
              type="button"
              className="list-input__remove"
              aria-label={`Remover ${item.recipeTitle} de ${label}`}
              onClick={() => onRemoveItem(item.id)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <label>
        Receita
        <select value={recipeId} onChange={(e) => setRecipeId(e.target.value)}>
          <option value="">Selecione...</option>
          {recipes.map((recipe) => (
            <option key={recipe.id} value={recipe.id}>
              {recipe.title}
            </option>
          ))}
        </select>
      </label>
      <label>
        Refeição
        <select value={mealType} onChange={(e) => setMealType(e.target.value as MealType)}>
          {MEAL_TYPES.map((type) => (
            <option key={type} value={type}>
              {MEAL_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </label>
      <button type="button" className="secondary" onClick={handleAdd} disabled={!recipeId}>
        Adicionar
      </button>
    </div>
  );
}
