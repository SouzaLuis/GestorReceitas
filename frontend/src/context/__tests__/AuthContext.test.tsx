import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { AuthProvider, useAuth } from "../AuthContext";

function TestConsumer() {
  const { user, isAuthenticated, setSession, logout } = useAuth();
  return (
    <div>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="user-name">{user?.name ?? "none"}</span>
      <button
        onClick={() =>
          setSession({
            user: { id: 1, name: "Ana", email: "ana@test.com", avatarUrl: null },
            token: "abc",
          })
        }
      >
        login
      </button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => localStorage.clear());

  it("starts unauthenticated", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    expect(screen.getByTestId("authenticated").textContent).toBe("false");
  });

  it("authenticates after setSession and persists to localStorage", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText("login").click();
    });

    expect(screen.getByTestId("authenticated").textContent).toBe("true");
    expect(screen.getByTestId("user-name").textContent).toBe("Ana");
    expect(localStorage.getItem("gestao-receitas:token")).toBe("abc");
  });

  it("clears session on logout", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText("login").click();
    });
    await act(async () => {
      screen.getByText("logout").click();
    });

    expect(screen.getByTestId("authenticated").textContent).toBe("false");
    expect(localStorage.getItem("gestao-receitas:token")).toBeNull();
  });
});
