import { defineStore } from "pinia";

import { useApi } from "../composables/useApi";

export const useCharactersStore = defineStore("characters", {
	state: () => ({
		characters: [],
		error: "",
		isLoading: false,
	}),
	actions: {
		async createCharacter(character) {
			const { apiCall } = useApi();
			const createdCharacter = await apiCall("createCharacter", { character });

			this.characters.push(createdCharacter);
			return createdCharacter;
		},
		async fetchCharacters() {
			const { apiCall } = useApi();

			this.error = "";
			this.isLoading = true;

			try {
				this.characters = await apiCall("getCharacters");
			} catch (error) {
				this.error = error.message;
				throw error;
			} finally {
				this.isLoading = false;
			}
		},
		async updateCharacter(characterId, updates) {
			const { apiCall } = useApi();
			const updatedCharacter = await apiCall("updateCharacter", {
				characterId,
				updates,
			});
			const characterIndex = this.characters.findIndex((character) => character.characterId === characterId);

			if (characterIndex >= 0) {
				this.characters.splice(characterIndex, 1, updatedCharacter);
			}

			return updatedCharacter;
		},
	},
});
