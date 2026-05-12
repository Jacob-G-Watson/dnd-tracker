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

	describe("given the current user is a dungeon master", () => {
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

			expect(characters.getCharacters("u999", "dungeonMaster")).toHaveLength(2);
		});
	});
});

describe("updateCharacter", () => {
	describe("given the current user does not own the character and is not a dungeon master", () => {
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

describe("listUsersForDirectory", () => {
	describe("given the current user is a dungeon master", () => {
		it("when called then returns safe user fields and excludes the requester", () => {
			const spreadsheet = createSpreadsheet({
				Users: createSheet([
					["userId", "firstName", "lastName", "email", "username", "passwordHash", "role"],
					["u001", "Alice", "Stone", "alice@example.com", "alice", "hash-a", "player"],
					["u002", "Mira", "Gray", "mira@example.com", "mira", "hash-b", "player"],
				]),
			});

			installGasMocks({ spreadsheet });
			const { characters } = loadBackend();

			const result = characters.listUsersForDirectory("u001", "dungeonMaster");

			expect(result).toHaveLength(1);
			expect(result[0]).toEqual({
				firstName: "Mira",
				lastName: "Gray",
				role: "player",
				userId: "u002",
				username: "mira",
			});
			expect(result[0].email).toBeUndefined();
			expect(result[0].passwordHash).toBeUndefined();
		});
	});

	describe("given the current user is a player", () => {
		it("when called then it throws an authorization error", () => {
			installGasMocks();
			const { characters } = loadBackend();

			expect(() => characters.listUsersForDirectory("u001", "player")).toThrow(
				"Only dungeon masters can perform this action",
			);
		});
	});
});

describe("getUserCharacters", () => {
	describe("given the current user is a dungeon master", () => {
		it("when called then returns the selected user's characters", () => {
			const spreadsheet = createSpreadsheet({
				Characters: createSheet([
					["characterId", "userId", "name", "class", "race", "sessions", "description"],
					["c001", "u001", "Thorne", "Rogue", "Elf", 5, "Quiet wanderer"],
					["c002", "u002", "Mira", "Cleric", "Human", 3, "Healer"],
				]),
			});

			installGasMocks({ spreadsheet });
			const { characters } = loadBackend();

			const result = characters.getUserCharacters("u002", "dungeonMaster");

			expect(result).toHaveLength(1);
			expect(result[0].characterId).toBe("c002");
		});
	});

	describe("given the current user is a player", () => {
		it("when called then it throws an authorization error", () => {
			installGasMocks();
			const { characters } = loadBackend();

			expect(() => characters.getUserCharacters("u001", "player")).toThrow(
				"Only dungeon masters can perform this action",
			);
		});
	});
});
