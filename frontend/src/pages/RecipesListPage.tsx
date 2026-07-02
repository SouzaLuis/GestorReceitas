import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { listFeed, listRecipes } from "../api/recipes";
import { RecipeGrid } from "../components/RecipeGrid";
import { useAuth } from "../context/AuthContext";
import type { Recipe } from "../types";

type Tab = "mine" | "feed" | "explore";

export function RecipesListPage() {
  const { isAuthenticated, user } = useAuth();
  const [tab, setTab] = useState<Tab>(isAuthenticated ? "feed" : "explore");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchTab(activeTab: Tab, filters: { search?: string; category?: string } = {}) {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === "mine" && user) {
        setRecipes(await listRecipes({ ...filters, authorId: user.id }));
      } else if (activeTab === "feed") {
        setRecipes(await listFeed());
      } else {
        setRecipes(await listRecipes(filters));
      }
    } catch {
      setError("Não foi possível carregar as receitas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTab(tab);
  }, [tab]);

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    fetchTab(tab, { search: search || undefined, category: category || undefined });
  }

  return (
    <main className="page">
      <h1>Receitas</h1>
      <p>Descubra, salve e compartilhe receitas com a comunidade.</p>

      {isAuthenticated && (
        <div className="tabs">
          <button
            type="button"
            className={tab === "mine" ? "tab tab--active" : "tab"}
            onClick={() => setTab("mine")}
          >
            Minhas receitas
          </button>
          <button
            type="button"
            className={tab === "feed" ? "tab tab--active" : "tab"}
            onClick={() => setTab("feed")}
          >
            Feed
          </button>
          <button
            type="button"
            className={tab === "explore" ? "tab tab--active" : "tab"}
            onClick={() => setTab("explore")}
          >
            Explorar
          </button>
        </div>
      )}

      {tab !== "feed" && (
        <form className="filters" onSubmit={handleSearch}>
          <label>
            Buscar
            <input
              placeholder="Ex: bolo de cenoura"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <label>
            Categoria
            <input
              placeholder="Ex: sobremesa"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </label>
          <button type="submit">Filtrar</button>
        </form>
      )}

      {error && <p role="alert">{error}</p>}

      {loading ? (
        <p>Carregando...</p>
      ) : recipes.length === 0 ? (
        <div className="empty-state card">
          {tab === "feed" ? (
            <>
              <p>Ninguém que você segue publicou receitas ainda.</p>
              <Link to="/search">Buscar pessoas para seguir</Link>
            </>
          ) : (
            <>
              <p>Nenhuma receita encontrada.</p>
              <Link to="/recipes/new">Que tal cadastrar a primeira?</Link>
            </>
          )}
        </div>
      ) : (
        <RecipeGrid recipes={recipes} />
      )}
    </main>
  );
}
