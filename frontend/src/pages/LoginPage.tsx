import axios from "axios";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { AuthResponse } from "../types";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setSession } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data } = await apiClient.post<AuthResponse>("/api/auth/login", {
        email,
        password,
      });
      setSession(data);
      navigate("/");
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.error ?? "Falha ao entrar")
        : "Falha ao entrar";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3333";
    window.location.href = `${apiUrl}/api/auth/google`;
  }

  return (
    <main className="page page--narrow">
      <h1>Entrar</h1>
      <form className="card" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Senha
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
        <button type="button" className="secondary" onClick={handleGoogleLogin}>
          Entrar com Google
        </button>
      </form>
      <p>
        Não tem conta? <Link to="/register">Cadastre-se</Link>
      </p>
    </main>
  );
}
