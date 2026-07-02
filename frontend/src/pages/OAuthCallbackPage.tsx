import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiClient } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { User } from "../types";

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken, setUser } = useAuth();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const token = searchParams.get("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setToken(token);

    apiClient
      .get<{ user: User }>("/api/me")
      .then(({ data }) => {
        setUser(data.user);
        navigate("/", { replace: true });
      })
      .catch(() => navigate("/login", { replace: true }));
  }, [searchParams, navigate, setToken, setUser]);

  return (
    <main className="page page--narrow">
      <p>Finalizando login...</p>
    </main>
  );
}
