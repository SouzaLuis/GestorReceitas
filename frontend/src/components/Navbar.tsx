import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="navbar">
      <Link to="/" className="navbar__brand">
        🍲 Gestão Receitas
      </Link>
      <nav className="navbar__links">
        <Link to="/">Receitas</Link>
        {isAuthenticated ? (
          <>
            <Link to="/recipes/new">Nova receita</Link>
            <Link to="/favorites">Favoritas</Link>
            <Link to="/meal-plan">Planejamento</Link>
            <Link to="/search">Buscar pessoas</Link>
            {user && (
              <Link to={`/users/${user.id}`}>Olá, {user.name.split(" ")[0]}</Link>
            )}
            <button type="button" className="secondary" onClick={logout}>
              Sair
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Entrar</Link>
            <Link to="/register">Cadastrar</Link>
          </>
        )}
      </nav>
    </header>
  );
}
