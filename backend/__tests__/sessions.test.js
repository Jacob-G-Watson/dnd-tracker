const { createSheet, createSpreadsheet, installGasMocks } = require("./gas-mocks");
const { loadBackend } = require("./load-backend");

describe("validateSession", () => {
	describe("given a valid session token", () => {
		it("when called then returns the owning userId", () => {
			const spreadsheet = createSpreadsheet({
				Sessions: createSheet([
					["token", "userId", "createdAt", "expiresAt"],
					["token-1", "u001", "2026-04-08T00:00:00.000Z", "2099-04-08T00:00:00.000Z"],
				]),
			});

			installGasMocks({ spreadsheet });
			const { sessions } = loadBackend();

			expect(sessions.validateSession("token-1")).toBe("u001");
		});
	});

	describe("given an expired session token", () => {
		it("when called then returns null", () => {
			const spreadsheet = createSpreadsheet({
				Sessions: createSheet([
					["token", "userId", "createdAt", "expiresAt"],
					["token-1", "u001", "2020-04-08T00:00:00.000Z", "2020-04-09T00:00:00.000Z"],
				]),
			});

			installGasMocks({ spreadsheet });
			const { sessions } = loadBackend();

			expect(sessions.validateSession("token-1")).toBeNull();
		});
	});
});
