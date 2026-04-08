function arrayBufferToHex(arrayBuffer) {
	return Array.from(new Uint8Array(arrayBuffer))
		.map((value) => value.toString(16).padStart(2, "0"))
		.join("");
}

export async function hashPassword(password) {
	const message = new TextEncoder().encode(password);
	const digest = await crypto.subtle.digest("SHA-256", message);

	return arrayBufferToHex(digest);
}
