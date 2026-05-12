import { defineStore } from "pinia";

import { useApi } from "../composables/useApi";

export const useCharactersStore = defineStore("characters", {
	state: () => ({
		characters: [],
		directoryError: "",
		directoryUsers: [],
		isDirectoryCharactersLoading: false,
		isDirectoryUsersLoading: false,
		error: "",
		isLoading: false,
		selectedUserCharacters: [],
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
		async fetchDirectoryUsers() {
			const { apiCall } = useApi();

			this.directoryError = "";
			this.isDirectoryUsersLoading = true;

			try {
				this.directoryUsers = await apiCall("listUsersForDirectory");
			} catch (error) {
				this.directoryError = error.message;
				throw error;
			} finally {
				this.isDirectoryUsersLoading = false;
			}
		},
		async fetchUserCharacters(userId) {
			const { apiCall } = useApi();

			this.directoryError = "";
			this.isDirectoryCharactersLoading = true;

			try {
				this.selectedUserCharacters = await apiCall("getUserCharacters", { userId });
			} catch (error) {
				this.directoryError = error.message;
				throw error;
			} finally {
				this.isDirectoryCharactersLoading = false;
			}
		},
		resetDirectoryState() {
			this.directoryError = "";
			this.directoryUsers = [];
			this.selectedUserCharacters = [];
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
