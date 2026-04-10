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

describe("registerCustom", () => {
	describe("given the username is not taken", () => {
		it("when called then creates the user and returns a session", () => {
			const spreadsheet = createSpreadsheet({
				Sessions: createSheet([["token", "userId", "createdAt", "expiresAt"]]),
				Users: createSheet([["userId", "firstName", "lastName", "email", "username", "passwordHash", "role"]]),
			});

			installGasMocks({ spreadsheet });
			const { auth } = loadBackend();

			const session = auth.registerCustom("Bob", "Carter", "bob", "hash-2");

			expect(session.firstName).toBe("Bob");
			expect(session.lastName).toBe("Carter");
			expect(session.role).toBe("player");
			expect(session.token).toBeTruthy();
			expect(session.userId).toBeTruthy();
		});
	});

	describe("given the username is already taken", () => {
		it("when called then throws a username taken error", () => {
			const spreadsheet = createSpreadsheet({
				Sessions: createSheet([["token", "userId", "createdAt", "expiresAt"]]),
				Users: createSheet([
					["userId", "firstName", "lastName", "email", "username", "passwordHash", "role"],
					["u001", "Alice", "Stone", "", "alice", "hash-1", "player"],
				]),
			});

			installGasMocks({ spreadsheet });
			const { auth } = loadBackend();

			expect(() => auth.registerCustom("Alice", "Smith", "alice", "hash-x")).toThrow("Username is already taken");
		});
	});

	describe("given required fields are missing", () => {
		it("when called without a username then throws a required fields error", () => {
			const spreadsheet = createSpreadsheet({
				Sessions: createSheet([["token", "userId", "createdAt", "expiresAt"]]),
				Users: createSheet([["userId", "firstName", "lastName", "email", "username", "passwordHash", "role"]]),
			});

			installGasMocks({ spreadsheet });
			const { auth } = loadBackend();

			expect(() => auth.registerCustom("Bob", "Carter", "", "hash-2")).toThrow(
				"All fields are required to register",
			);
		});
	});
});

describe("registerGoogle", () => {
	describe("given the Google email is not already registered", () => {
		it("when called then creates the user and returns a session", () => {
			const spreadsheet = createSpreadsheet({
				Users: createSheet([["userId", "firstName", "lastName", "email", "username", "passwordHash", "role"]]),
			});

			installGasMocks({
				googleTokenPayload: {
					aud: "client-id",
					email: "new@example.com",
					family_name: "New",
					given_name: "User",
				},
				properties: {
					GOOGLE_CLIENT_ID: "client-id",
				},
				spreadsheet,
			});
			const { auth } = loadBackend();

			const session = auth.registerGoogle("id-token");

			expect(session.firstName).toBe("User");
			expect(session.lastName).toBe("New");
			expect(session.role).toBe("player");
			expect(session.token).toBe("id-token");
		});
	});

	describe("given the Google email is already registered", () => {
		it("when called then throws an account exists error", () => {
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

			expect(() => auth.registerGoogle("id-token")).toThrow("An account with this Google email already exists");
		});
	});
});
