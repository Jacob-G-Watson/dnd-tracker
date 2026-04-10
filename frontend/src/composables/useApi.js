import { useAuthStore } from "../stores/auth";

const API_URL =
	"https://script.google.com/macros/s/AKfycbx0H0ta7nuS2DzJmXjDmu0yqRxndFSOpw4zFTnZ63HsMo-JaXMnwwMWWOs0vx2q0vNV1Q/exec";
const AUTH_ERROR_MESSAGES = ["Authentication is required", "Invalid or expired session"];
const CONTENT_TYPE_TEXT = "text/plain;charset=utf-8";

function buildRequestBody(action, payload, authStore) {
	const body = {
		action,
		...payload,
	};

	if (authStore.token && !body.token && !body.idToken && !body.googleIdToken) {
		body.token = authStore.token;
	}

	return body;
}

function isAuthenticationFailure(message) {
	return AUTH_ERROR_MESSAGES.includes(message);
}

async function parseResponse(response) {
	const responseText = await response.text();
	return JSON.parse(responseText || "{}");
}

export function useApi(router) {
	const authStore = useAuthStore();

	async function apiCall(action, payload = {}) {
		const requestBody = buildRequestBody(action, payload, authStore);
		const response = await fetch(API_URL, {
			body: JSON.stringify(requestBody),
			headers: {
				"Content-Type": CONTENT_TYPE_TEXT,
			},
			method: "POST",
		});
		const result = await parseResponse(response);

		if (!result.ok) {
			if (isAuthenticationFailure(result.message)) {
				authStore.logout();

				if (router) {
					await router.push({ name: "login" });
				}
			}

			throw new Error(result.message || "Unexpected API error");
		}

		return result.data;
	}

	return {
		apiCall,
	};
}

export const apiConfiguration = {
	API_URL,
};
