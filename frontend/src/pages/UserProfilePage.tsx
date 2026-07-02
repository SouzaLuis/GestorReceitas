import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { listRecipes } from "../api/recipes";
import { followUser, getUserProfile, unfollowUser } from "../api/social";
import { RecipeGrid } from "../components/RecipeGrid";
import { useAuth } from "../context/AuthContext";
import type { Recipe, UserProfile } from "../types";

export function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getUserProfile(Number(id))
      .then(setProfile)
      .catch(() => setError("Usuário não encontrado."));
    listRecipes({ authorId: Number(id) }).then(setRecipes);
  }, [id]);

  async function toggleFollow() {
    if (!profile) return;
    try {
      if (profile.isFollowing) {
        await unfollowUser(profile.id);
      } else {
        await followUser(profile.id);
      }
      setProfile({ ...profile, isFollowing: !profile.isFollowing });
    } catch {
      setError("Não foi possível atualizar o status de seguir.");
    }
  }

  if (error) {
    return (
      <main className="page">
        <p role="alert">{error}</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="page">
        <p>Carregando...</p>
      </main>
    );
  }

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <main className="page">
      <h1>{profile.name}</h1>
      <p>
        {profile.recipeCount} receitas · {profile.followerCount} seguidores ·{" "}
        {profile.followingCount} seguindo
      </p>

      {!isOwnProfile && (
        <button type="button" className="secondary" onClick={toggleFollow}>
          {profile.isFollowing ? "Deixar de seguir" : "Seguir"}
        </button>
      )}

      {profile.following.length > 0 && (
        <section className="recipe-section">
          <h2>Seguindo</h2>
          <ul className="user-list user-list--compact">
            {profile.following.map((followed) => (
              <li key={followed.id}>
                <Link to={`/users/${followed.id}`}>{followed.name}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="recipe-section">
        <h2>Receitas</h2>
        {recipes.length === 0 ? <p>Nenhuma receita publicada ainda.</p> : <RecipeGrid recipes={recipes} />}
      </section>
    </main>
  );
}
