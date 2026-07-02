import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { followUser, searchUsers, suggestUsers, unfollowUser } from "../api/social";
import type { UserSearchResult } from "../types";

export function UserSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[] | null>(null);
  const [suggestions, setSuggestions] = useState<UserSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    suggestUsers()
      .then(setSuggestions)
      .catch(() => setError("Não foi possível carregar sugestões."));
  }, []);

  async function handleSearch(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      setResults(await searchUsers(query.trim()));
    } catch {
      setError("Não foi possível buscar usuários.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleFollow(user: UserSearchResult, list: "results" | "suggestions") {
    try {
      if (user.isFollowing) {
        await unfollowUser(user.id);
      } else {
        await followUser(user.id);
      }
      const update = (u: UserSearchResult) =>
        u.id === user.id ? { ...u, isFollowing: !u.isFollowing } : u;

      if (list === "results") {
        setResults((prev) => prev?.map(update) ?? prev);
      } else {
        setSuggestions((prev) => prev.map(update));
      }
    } catch {
      setError("Não foi possível atualizar o status de seguir.");
    }
  }

  return (
    <main className="page page--narrow">
      <h1>Buscar pessoas</h1>

      <form className="filters" onSubmit={handleSearch}>
        <label>
          Nome ou email
          <input
            placeholder="Ex: Maria"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {error && <p role="alert">{error}</p>}

      {results !== null && (
        <section className="recipe-section">
          <h2>Resultados</h2>
          {results.length === 0 ? (
            <p>Nenhum usuário encontrado.</p>
          ) : (
            <ul className="user-list">
              {results.map((user) => (
                <UserListItem key={user.id} user={user} onToggleFollow={() => toggleFollow(user, "results")} />
              ))}
            </ul>
          )}
        </section>
      )}

      <section className="recipe-section">
        <h2>Sugestões para seguir</h2>
        {suggestions.length === 0 ? (
          <p>Nenhuma sugestão no momento.</p>
        ) : (
          <ul className="user-list">
            {suggestions.map((user) => (
              <UserListItem key={user.id} user={user} onToggleFollow={() => toggleFollow(user, "suggestions")} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function UserListItem({
  user,
  onToggleFollow,
}: {
  user: UserSearchResult;
  onToggleFollow: () => void;
}) {
  return (
    <li className="user-list__item card">
      <Link to={`/users/${user.id}`} className="user-list__info">
        <strong>{user.name}</strong>
        <span>
          {user.recipeCount} receitas · {user.followerCount} seguidores
        </span>
      </Link>
      <button type="button" className="secondary" onClick={onToggleFollow}>
        {user.isFollowing ? "Deixar de seguir" : "Seguir"}
      </button>
    </li>
  );
}
