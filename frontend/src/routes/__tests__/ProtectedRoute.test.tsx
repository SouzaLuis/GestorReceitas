import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "../../context/AuthContext";
import { ProtectedRoute } from "../ProtectedRoute";

function renderWithRoute(initialPath: string) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<p>login page</p>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<p>home page</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe("ProtectedRoute", () => {
  it("redirects to /login when unauthenticated", () => {
    localStorage.clear();
    renderWithRoute("/");
    expect(screen.getByText("login page")).toBeInTheDocument();
  });

  it("renders the protected content when authenticated", () => {
    localStorage.setItem("gestao-receitas:token", "abc");
    renderWithRoute("/");
    expect(screen.getByText("home page")).toBeInTheDocument();
    localStorage.clear();
  });
});
