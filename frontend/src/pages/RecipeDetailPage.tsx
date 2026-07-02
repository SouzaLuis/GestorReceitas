import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteRecipe, favoriteRecipe, getRecipe, unfavoriteRecipe } from "../api/recipes";
import { useAuth } from "../context/AuthContext";
import type { Recipe } from "../types";

export function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    getRecipe(Number(id))
      .then(setRecipe)
      .catch(() => setError("Receita não encontrada."));
  }, [id]);

  async function handleToggleFavorite() {
    if (!recipe) return;
    try {
      if (isFavorite) {
        await unfavoriteRecipe(recipe.id);
      } else {
        await favoriteRecipe(recipe.id);
      }
      setIsFavorite(!isFavorite);
    } catch {
      setError("Não foi possível atualizar os favoritos.");
    }
  }

  async function handleDelete() {
    if (!recipe) return;
    try {
      await deleteRecipe(recipe.id);
      navigate("/");
    } catch {
      setError("Não foi possível excluir a receita.");
    }
  }

  if (error) {
    return (
      <main className="page">
        <p role="alert">{error}</p>
        <Link to="/">← Voltar</Link>
      </main>
    );
  }

  if (!recipe) {
    return (
      <main className="page">
        <p>Carregando...</p>
      </main>
    );
  }

  const isOwner = user?.id === recipe.authorId;

  return (
    <main className="page">
      <Link to="/">← Voltar</Link>

      {recipe.imageUrl && (
        <img className="recipe-hero__image" src={recipe.imageUrl} alt={recipe.title} />
      )}

      <h1>{recipe.title}</h1>
      {recipe.description && <p>{recipe.description}</p>}

      <div className="recipe-meta">
        {recipe.category && <span className="badge">{recipe.category}</span>}
        {recipe.prepTimeMinutes && <span>⏱ {recipe.prepTimeMinutes} min</span>}
        {recipe.servings && <span>🍽 {recipe.servings} porções</span>}
      </div>

      <div className="button-row">
        {isAuthenticated && (
          <button type="button" className="secondary" onClick={handleToggleFavorite}>
            {isFavorite ? "★ Remover dos favoritos" : "☆ Favoritar"}
          </button>
        )}
        {isOwner && (
          <>
            <Link to={`/recipes/${recipe.id}/edit`}>
              <button type="button" className="secondary">
                Editar
              </button>
            </Link>
            <button type="button" className="danger" onClick={handleDelete}>
              Excluir
            </button>
          </>
        )}
      </div>

      <section className="recipe-section card">
        <h2>Ingredientes</h2>
        <ul>
          {recipe.ingredients.map((ingredient, i) => (
            <li key={i}>{ingredient}</li>
          ))}
        </ul>
      </section>

      <section className="recipe-section card">
        <h2>Modo de preparo</h2>
        <ol>
          {recipe.instructions.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>
    </main>
  );
}
