const { createSheet, createSpreadsheet, installGasMocks } = require("./gas-mocks");
const { loadBackend } = require("./load-backend");

describe("getUserByEmail", () => {
	describe("given a Users sheet with matching data", () => {
		it("when called with an existing email then returns the matching user", () => {
			const spreadsheet = createSpreadsheet({
				Users: createSheet([
					["userId", "firstName", "lastName", "email", "username", "passwordHash", "role"],
					["u001", "Alice", "Stone", "alice@example.com", "", "", "player"],
				]),
			});

			installGasMocks({ spreadsheet });
			const { sheets } = loadBackend();

			const user = sheets.getUserByEmail("alice@example.com");

			expect(user.userId).toBe("u001");
			expect(user.firstName).toBe("Alice");
		});
	});

	describe("given a Users sheet without a matching email", () => {
		it("when called then returns null", () => {
			const spreadsheet = createSpreadsheet({
				Users: createSheet([["userId", "firstName", "lastName", "email", "username", "passwordHash", "role"]]),
			});

			installGasMocks({ spreadsheet });
			const { sheets } = loadBackend();

			expect(sheets.getUserByEmail("missing@example.com")).toBeNull();
		});
	});
});
