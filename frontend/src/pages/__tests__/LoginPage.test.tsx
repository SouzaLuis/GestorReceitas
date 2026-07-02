import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../../api/client";
import { AuthProvider } from "../../context/AuthContext";
import { LoginPage } from "../LoginPage";

vi.mock("../../api/client", () => ({
  apiClient: { post: vi.fn() },
}));

function renderLoginPage() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </AuthProvider>
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(apiClient.post).mockReset();
  });

  it("logs in successfully and stores the session", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { user: { id: 1, name: "Ana", email: "ana@test.com", avatarUrl: null }, token: "abc" },
    });

    renderLoginPage();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "ana@test.com");
    await user.type(screen.getByLabelText(/senha/i), "password123");
    await user.click(screen.getByRole("button", { name: /^entrar$/i }));

    await waitFor(() => {
      expect(localStorage.getItem("gestao-receitas:token")).toBe("abc");
    });
    expect(apiClient.post).toHaveBeenCalledWith("/api/auth/login", {
      email: "ana@test.com",
      password: "password123",
    });
  });

  it("shows an error message on invalid credentials", async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce({
      isAxiosError: true,
      response: { data: { error: "Invalid credentials" } },
    });

    renderLoginPage();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "ana@test.com");
    await user.type(screen.getByLabelText(/senha/i), "wrong-password");
    await user.click(screen.getByRole("button", { name: /^entrar$/i }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
