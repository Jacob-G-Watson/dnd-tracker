const { createSheet, createSpreadsheet, installGasMocks } = require("./gas-mocks");
const { loadBackend } = require("./load-backend");

describe("getCharacters", () => {
	describe("given the current user is a player", () => {
		it("when called then returns only their characters", () => {
			const spreadsheet = createSpreadsheet({
				Characters: createSheet([
					["characterId", "userId", "name", "class", "race", "sessions", "description"],
					["c001", "u001", "Thorne", "Rogue", "Elf", 5, "Quiet wanderer"],
					["c002", "u002", "Mira", "Cleric", "Human", 3, "Healer"],
				]),
			});

			installGasMocks({ spreadsheet });
			const { characters } = loadBackend();

			const result = characters.getCharacters("u001", "player");

			expect(result).toHaveLength(1);
			expect(result[0].characterId).toBe("c001");
		});
	});

	describe("given the current user is a DM", () => {
		it("when called then returns all characters", () => {
			const spreadsheet = createSpreadsheet({
				Characters: createSheet([
					["characterId", "userId", "name", "class", "race", "sessions", "description"],
					["c001", "u001", "Thorne", "Rogue", "Elf", 5, "Quiet wanderer"],
					["c002", "u002", "Mira", "Cleric", "Human", 3, "Healer"],
				]),
			});

			installGasMocks({ spreadsheet });
			const { characters } = loadBackend();

			expect(characters.getCharacters("u999", "DM")).toHaveLength(2);
		});
	});
});

describe("updateCharacter", () => {
	describe("given the current user does not own the character and is not a DM", () => {
		it("when called then it throws a permission error", () => {
			const spreadsheet = createSpreadsheet({
				Characters: createSheet([
					["characterId", "userId", "name", "class", "race", "sessions", "description"],
					["c001", "u001", "Thorne", "Rogue", "Elf", 5, "Quiet wanderer"],
				]),
			});

			installGasMocks({ spreadsheet });
			const { characters } = loadBackend();

			expect(() => {
				characters.updateCharacter(
					"c001",
					{
						class: "Fighter",
						description: "Updated",
						name: "Thorne",
						race: "Elf",
						sessions: 6,
					},
					"u002",
					"player",
				);
			}).toThrow("You do not have permission");
		});
	});
});
