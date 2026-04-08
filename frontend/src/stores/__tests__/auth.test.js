import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

import { authStorageKeys, useAuthStore } from "../auth";

describe("useAuthStore", () => {
	beforeEach(() => {
		localStorage.clear();
		setActivePinia(createPinia());
	});

	describe("given the api returns a successful custom login response", () => {
		it("when loginWithCustom is called then it stores the user and token in state and localStorage", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				text: () =>
					Promise.resolve(
						JSON.stringify({
							data: {
								firstName: "Alice",
								lastName: "Stone",
								role: "player",
								token: "token-1",
								userId: "u001",
							},
							ok: true,
						}),
					),
			});
			const authStore = useAuthStore();

			await authStore.loginWithCustom("alice", "hash-1");

			expect(authStore.token).toBe("token-1");
			expect(authStore.user.userId).toBe("u001");
			expect(localStorage.getItem(authStorageKeys.STORAGE_KEY_TOKEN)).toBe("token-1");
		});
	});

	describe("given a logged-in state", () => {
		it("when logout is called then it clears state and localStorage", () => {
			const authStore = useAuthStore();
			authStore.user = { userId: "u001" };
			authStore.token = "token-1";
			localStorage.setItem(authStorageKeys.STORAGE_KEY_TOKEN, "token-1");

			authStore.logout();

			expect(authStore.user).toBeNull();
			expect(authStore.token).toBe("");
			expect(localStorage.getItem(authStorageKeys.STORAGE_KEY_TOKEN)).toBeNull();
		});
	});
});
