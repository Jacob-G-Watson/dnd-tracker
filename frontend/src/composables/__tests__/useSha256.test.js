import { describe, expect, it } from "vitest";
import { webcrypto } from "node:crypto";

import { hashPassword } from "../useSha256";

describe("hashPassword", () => {
	describe("given a known password string", () => {
		it("when called then it returns the expected sha256 hex digest", async () => {
			Object.defineProperty(globalThis, "crypto", {
				configurable: true,
				value: webcrypto,
			});

			const digest = await hashPassword("swordfish");

			expect(digest).toBe("b9f195c5cc7ef6afadbfbc42892ad47d3b24c6bc94bb510c4564a90a14e8b799");
		});
	});
});
