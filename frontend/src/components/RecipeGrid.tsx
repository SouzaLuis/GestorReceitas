import { Link } from "react-router-dom";
import type { Recipe } from "../types";

export function RecipeGrid({ recipes }: { recipes: Recipe[] }) {
  return (
    <ul className="recipe-grid">
      {recipes.map((recipe) => (
        <li key={recipe.id}>
          <Link to={`/recipes/${recipe.id}`} className="recipe-card">
            {recipe.imageUrl ? (
              <img className="recipe-card__image" src={recipe.imageUrl} alt={recipe.title} />
            ) : (
              <div className="recipe-card__image recipe-card__image--placeholder">🍽️</div>
            )}
            <div className="recipe-card__body">
              <div className="recipe-card__title">{recipe.title}</div>
              {recipe.category && <span className="badge">{recipe.category}</span>}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
