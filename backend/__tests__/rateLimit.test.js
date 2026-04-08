const { createScriptCache, installGasMocks } = require("./gas-mocks");
const { loadBackend } = require("./load-backend");

describe("checkRateLimit", () => {
	describe("given a user has already made 30 requests in the current minute", () => {
		it("when the 31st request is made then it throws a rate limit error", () => {
			const cache = createScriptCache();
			installGasMocks({ cache });
			const { rateLimit } = loadBackend();

			for (let index = 0; index < 30; index += 1) {
				rateLimit.checkRateLimit("u001", "getCharacters");
			}

			expect(() => rateLimit.checkRateLimit("u001", "getCharacters")).toThrow("Rate limit exceeded");
		});
	});
});
