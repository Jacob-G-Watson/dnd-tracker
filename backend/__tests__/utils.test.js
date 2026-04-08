const { installGasMocks } = require("./gas-mocks");
const { loadBackend } = require("./load-backend");

describe("generateToken", () => {
	describe("given the utility services are available", () => {
		it("when called then returns a non-empty token string", () => {
			installGasMocks();
			const { utils } = loadBackend();

			const token = utils.generateToken();

			expect(token).toBe("123e4567e89b12d3a456426614174000123e4567e89b12d3a456426614174000");
		});
	});
});
