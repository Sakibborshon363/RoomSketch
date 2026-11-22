import { describe, it, expect, beforeEach } from "vitest";

// Robust localStorage mock for Node 22/23+
const mockStore: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => mockStore[key] || null,
  setItem: (key: string, value: string) => {
    mockStore[key] = String(value);
  },
  removeItem: (key: string) => {
    delete mockStore[key];
  },
  clear: () => {
    for (const key of Object.keys(mockStore)) {
      delete mockStore[key];
    }
  },
};

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});

import { useAuthStore } from "../src/store/authStore";

describe("useAuthStore state management", () => {
  beforeEach(() => {
    localStorageMock.clear();
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it("sets authentication token and user data", () => {
    const mockUser = {
      id: "u-123",
      email: "test@roomsketch.com",
      firstName: "Test",
      lastName: "User",
      role: "ROLE_USER",
    };

    useAuthStore.getState().setAuth("fake-token-abc", mockUser);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe("fake-token-abc");
    expect(state.user?.email).toBe("test@roomsketch.com");
    expect(localStorageMock.getItem("roomsketch_token")).toBe("fake-token-abc");
  });

  it("updates user profile fields", () => {
    const mockUser = {
      id: "u-123",
      email: "test@roomsketch.com",
      firstName: "Initial",
      lastName: "Name",
      role: "ROLE_USER",
    };

    useAuthStore.getState().setAuth("fake-token-abc", mockUser);
    useAuthStore.getState().updateUser({ firstName: "Updated", lastName: "Architect" });

    const state = useAuthStore.getState();
    expect(state.user?.firstName).toBe("Updated");
    expect(state.user?.lastName).toBe("Architect");
  });

  it("clears authentication state on logout", () => {
    useAuthStore.getState().setAuth("fake-token-abc", {
      id: "u-123",
      email: "test@roomsketch.com",
      firstName: "Test",
      lastName: "User",
      role: "ROLE_USER",
    });

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(localStorageMock.getItem("roomsketch_token")).toBeNull();
  });
});
