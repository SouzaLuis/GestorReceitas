import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listMyFavorites } from "../api/recipes";
import { RecipeGrid } from "../components/RecipeGrid";
import type { Recipe } from "../types";

export function FavoritesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listMyFavorites()
      .then(setRecipes)
      .catch(() => setError("Não foi possível carregar seus favoritos."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="page">
      <Link to="/">← Voltar</Link>
      <h1>Minhas receitas favoritas</h1>
      {loading && <p>Carregando...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && recipes.length === 0 && (
        <div className="empty-state card">
          <p>Você ainda não favoritou nenhuma receita.</p>
        </div>
      )}

      <RecipeGrid recipes={recipes} />
    </main>
  );
}
