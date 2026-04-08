const { createSheet, createSpreadsheet, installGasMocks } = require("./gas-mocks");
const { loadBackend } = require("./load-backend");

describe("loginCustom", () => {
	describe("given the username and password hash are correct", () => {
		it("when called then returns a token and user details", () => {
			const spreadsheet = createSpreadsheet({
				Sessions: createSheet([["token", "userId", "createdAt", "expiresAt"]]),
				Users: createSheet([
					["userId", "firstName", "lastName", "email", "username", "passwordHash", "role"],
					["u001", "Alice", "Stone", "", "alice", "hash-1", "player"],
				]),
			});

			installGasMocks({ spreadsheet });
			const { auth } = loadBackend();

			const session = auth.loginCustom("alice", "hash-1");

			expect(session.userId).toBe("u001");
			expect(session.token).toBeTruthy();
		});
	});
});

describe("loginGoogle", () => {
	describe("given the Google token audience matches the configured client id", () => {
		it("when called then returns the matching user session", () => {
			const spreadsheet = createSpreadsheet({
				Users: createSheet([
					["userId", "firstName", "lastName", "email", "username", "passwordHash", "role"],
					["u001", "Alice", "Stone", "alice@example.com", "", "", "player"],
				]),
			});

			installGasMocks({
				googleTokenPayload: {
					aud: "client-id",
					email: "alice@example.com",
				},
				properties: {
					GOOGLE_CLIENT_ID: "client-id",
				},
				spreadsheet,
			});
			const { auth } = loadBackend();

			const session = auth.loginGoogle("id-token");

			expect(session.userId).toBe("u001");
			expect(session.token).toBe("id-token");
		});
	});

	describe("given the Google token audience does not match the configured client id", () => {
		it("when called then it throws an invalid audience error", () => {
			installGasMocks({
				googleTokenPayload: {
					aud: "wrong-client",
					email: "alice@example.com",
				},
				properties: {
					GOOGLE_CLIENT_ID: "client-id",
				},
			});
			const { auth } = loadBackend();

			expect(() => auth.loginGoogle("id-token")).toThrow("Invalid Google token audience");
		});
	});
});
