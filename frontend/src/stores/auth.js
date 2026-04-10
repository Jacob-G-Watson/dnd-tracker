import { defineStore } from "pinia";

import { useApi } from "../composables/useApi";

const STORAGE_KEY_IS_GOOGLE = "dnd-tracker-is-google";
const STORAGE_KEY_TOKEN = "dnd-tracker-token";
const STORAGE_KEY_USER = "dnd-tracker-user";

function readJsonStorage(storageKey) {
	const value = localStorage.getItem(storageKey);
	return value ? JSON.parse(value) : null;
}

function persistSession(user, token, isGoogle) {
	localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
	localStorage.setItem(STORAGE_KEY_TOKEN, token || "");
	localStorage.setItem(STORAGE_KEY_IS_GOOGLE, JSON.stringify(Boolean(isGoogle)));
}

function clearSessionStorage() {
	localStorage.removeItem(STORAGE_KEY_USER);
	localStorage.removeItem(STORAGE_KEY_TOKEN);
	localStorage.removeItem(STORAGE_KEY_IS_GOOGLE);
}

export const useAuthStore = defineStore("auth", {
	state: () => ({
		isGoogle: JSON.parse(localStorage.getItem(STORAGE_KEY_IS_GOOGLE) || "false"),
		token: localStorage.getItem(STORAGE_KEY_TOKEN) || "",
		user: readJsonStorage(STORAGE_KEY_USER),
	}),
	actions: {
		async loginWithCustom(username, passwordHash) {
			const { apiCall } = useApi();
			const session = await apiCall("loginCustom", { passwordHash, username });

			this.user = buildUser(session);
			this.token = session.token;
			this.isGoogle = false;
			persistSession(this.user, this.token, this.isGoogle);
		},
		async loginWithGoogle(idToken) {
			const { apiCall } = useApi();
			const session = await apiCall("loginGoogle", { idToken });

			this.user = buildUser(session);
			this.token = idToken;
			this.isGoogle = true;
			persistSession(this.user, this.token, this.isGoogle);
		},
		async registerWithCustom(firstName, lastName, username, passwordHash) {
			const { apiCall } = useApi();
			const session = await apiCall("registerCustom", { firstName, lastName, passwordHash, username });

			this.user = buildUser(session);
			this.token = session.token;
			this.isGoogle = false;
			persistSession(this.user, this.token, false);
		},
		async registerWithGoogle(idToken) {
			const { apiCall } = useApi();
			const session = await apiCall("registerGoogle", { idToken });

			this.user = buildUser(session);
			this.token = idToken;
			this.isGoogle = true;
			persistSession(this.user, this.token, true);
		},
		logout() {
			this.user = null;
			this.token = "";
			this.isGoogle = false;
			clearSessionStorage();
		},
	},
});

function buildUser(session) {
	return {
		firstName: session.firstName,
		lastName: session.lastName,
		role: session.role,
		userId: session.userId,
	};
}

export const authStorageKeys = {
	STORAGE_KEY_IS_GOOGLE,
	STORAGE_KEY_TOKEN,
	STORAGE_KEY_USER,
};
