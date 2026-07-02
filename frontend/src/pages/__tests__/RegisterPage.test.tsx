import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../../api/client";
import { AuthProvider } from "../../context/AuthContext";
import { RegisterPage } from "../RegisterPage";

vi.mock("../../api/client", () => ({
  apiClient: { post: vi.fn() },
}));

function renderRegisterPage() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    </AuthProvider>
  );
}

describe("RegisterPage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(apiClient.post).mockReset();
  });

  it("registers successfully and stores the session", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { user: { id: 1, name: "Ana", email: "ana@test.com", avatarUrl: null }, token: "abc" },
    });

    renderRegisterPage();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/nome/i), "Ana");
    await user.type(screen.getByLabelText(/email/i), "ana@test.com");
    await user.type(screen.getByLabelText(/senha/i), "password123");
    await user.click(screen.getByRole("button", { name: /criar conta/i }));

    await waitFor(() => {
      expect(localStorage.getItem("gestao-receitas:token")).toBe("abc");
    });
  });

  it("shows an error message when email is already registered", async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce({
      isAxiosError: true,
      response: { data: { error: "Email already registered" } },
    });

    renderRegisterPage();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/nome/i), "Ana");
    await user.type(screen.getByLabelText(/email/i), "ana@test.com");
    await user.type(screen.getByLabelText(/senha/i), "password123");
    await user.click(screen.getByRole("button", { name: /criar conta/i }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
