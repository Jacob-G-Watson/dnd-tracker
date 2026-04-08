import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

import { useCharactersStore } from "../characters";

describe("useCharactersStore", () => {
	beforeEach(() => {
		localStorage.clear();
		setActivePinia(createPinia());
	});

	describe("given the api returns characters", () => {
		it("when fetchCharacters is called then it populates the store state", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				text: () =>
					Promise.resolve(
						JSON.stringify({
							data: [{ characterId: "c001", name: "Thorne" }],
							ok: true,
						}),
					),
			});
			const charactersStore = useCharactersStore();

			await charactersStore.fetchCharacters();

			expect(charactersStore.characters).toHaveLength(1);
			expect(charactersStore.characters[0].characterId).toBe("c001");
		});
	});

	describe("given the api returns an updated character", () => {
		it("when updateCharacter is called then it replaces the existing character in state", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				text: () =>
					Promise.resolve(
						JSON.stringify({
							data: { characterId: "c001", name: "Thorne", sessions: 6 },
							ok: true,
						}),
					),
			});
			const charactersStore = useCharactersStore();
			charactersStore.characters = [{ characterId: "c001", name: "Thorne", sessions: 5 }];

			await charactersStore.updateCharacter("c001", { sessions: 6 });

			expect(charactersStore.characters[0].sessions).toBe(6);
		});
	});
});
