import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../../api/client";
import { AuthProvider } from "../../context/AuthContext";
import { OAuthCallbackPage } from "../OAuthCallbackPage";

vi.mock("../../api/client", () => ({
  apiClient: { get: vi.fn() },
}));

function renderCallback(initialPath: string) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
          <Route path="/login" element={<p>login page</p>} />
          <Route path="/" element={<p>home page</p>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe("OAuthCallbackPage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(apiClient.get).mockReset();
  });

  it("stores the token, fetches the user and navigates home", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { user: { id: 1, name: "Ana", email: "ana@test.com", avatarUrl: null } },
    });

    renderCallback("/oauth/callback?token=abc123");

    await waitFor(() => expect(screen.getByText("home page")).toBeInTheDocument());
    expect(localStorage.getItem("gestao-receitas:token")).toBe("abc123");
    expect(localStorage.getItem("gestao-receitas:user")).toContain("Ana");
  });

  it("redirects to /login when there is no token", async () => {
    renderCallback("/oauth/callback");
    await waitFor(() => expect(screen.getByText("login page")).toBeInTheDocument());
  });

  it("redirects to /login when fetching the user fails", async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error("unauthorized"));

    renderCallback("/oauth/callback?token=abc123");
    await waitFor(() => expect(screen.getByText("login page")).toBeInTheDocument());
  });
});
