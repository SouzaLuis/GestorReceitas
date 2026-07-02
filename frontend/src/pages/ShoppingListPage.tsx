import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getShoppingList } from "../api/mealPlans";
import { toISODate, getMonday } from "../utils/date";
import type { ShoppingListEntry } from "../types";

export function ShoppingListPage() {
  const [searchParams] = useSearchParams();
  const weekStart = searchParams.get("weekStart") ?? toISODate(getMonday(new Date()));
  const [ingredients, setIngredients] = useState<ShoppingListEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getShoppingList(weekStart)
      .then(setIngredients)
      .catch(() => setError("Não foi possível carregar a lista de compras."))
      .finally(() => setLoading(false));
  }, [weekStart]);

  return (
    <main className="page page--narrow">
      <Link to="/meal-plan">← Voltar ao planejamento</Link>
      <h1>Lista de compras</h1>
      <p>Semana de {weekStart}</p>

      {error && <p role="alert">{error}</p>}
      {loading && <p>Carregando...</p>}

      {!loading && ingredients.length === 0 && (
        <div className="empty-state card">
          <p>Nenhum item ainda. Adicione receitas ao planejamento desta semana.</p>
        </div>
      )}

      {ingredients.length > 0 && (
        <ul className="shopping-list card">
          {ingredients.map((entry) => (
            <li key={entry.name}>
              <span>{entry.name}</span>
              {entry.count > 1 && <span className="badge">×{entry.count}</span>}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
