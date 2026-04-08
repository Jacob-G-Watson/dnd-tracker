import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

import { useApi } from "../useApi";
import { useAuthStore } from "../../stores/auth";

describe("apiCall", () => {
	beforeEach(() => {
		localStorage.clear();
		setActivePinia(createPinia());
	});

	describe("given the auth store contains a token", () => {
		it("when called then it includes the token in the post body", async () => {
			const authStore = useAuthStore();
			authStore.token = "token-1";
			global.fetch = vi.fn().mockResolvedValue({
				text: () => Promise.resolve(JSON.stringify({ data: { ok: true }, ok: true })),
			});

			const { apiCall } = useApi();

			await apiCall("getCharacters");

			expect(global.fetch).toHaveBeenCalledWith(
				"REPLACE_WITH_YOUR_APPS_SCRIPT_URL",
				expect.objectContaining({
					body: JSON.stringify({ action: "getCharacters", token: "token-1" }),
				}),
			);
		});
	});

	describe("given the api responds with an authentication error", () => {
		it("when called then it clears the auth store and redirects to login", async () => {
			const authStore = useAuthStore();
			authStore.token = "token-1";
			authStore.user = { userId: "u001" };
			global.fetch = vi.fn().mockResolvedValue({
				text: () => Promise.resolve(JSON.stringify({ message: "Invalid or expired session", ok: false })),
			});
			const router = {
				push: vi.fn(),
			};
			const { apiCall } = useApi(router);

			await expect(apiCall("getCharacters")).rejects.toThrow("Invalid or expired session");
			expect(authStore.token).toBe("");
			expect(router.push).toHaveBeenCalledWith({ name: "login" });
		});
	});
});
