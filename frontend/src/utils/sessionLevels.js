/**
 * Mapping of session counts to D&D character levels
 */
export const SESSION_LEVEL_MAP = [
	{ sessions: null, level: "N/A" },
	{ sessions: 0, level: 2 },
	{ sessions: 1, level: 3 },
	{ sessions: 2, level: 3 },
	{ sessions: 3, level: 4 },
	{ sessions: 4, level: 4 },
	{ sessions: 5, level: 4 },
	{ sessions: 6, level: 5 },
	{ sessions: 7, level: 5 },
	{ sessions: 8, level: 5 },
	{ sessions: 9, level: 5 },
	{ sessions: 10, level: 6 },
	{ sessions: 11, level: 6 },
	{ sessions: 12, level: 6 },
	{ sessions: 13, level: 6 },
	{ sessions: 14, level: 7 },
	{ sessions: 15, level: 7 },
	{ sessions: 16, level: 7 },
	{ sessions: 17, level: 7 },
	{ sessions: 18, level: 8 },
	{ sessions: 19, level: 8 },
	{ sessions: 20, level: 8 },
	{ sessions: 21, level: 8 },
	{ sessions: 22, level: "Retired" },
];

/**
 * Get the level for a given number of sessions
 * @param {number|null} sessions - The number of sessions (null for N/A)
 * @returns {string|number} The character level
 */
export function getLevelFromSessions(sessions) {
	if (sessions === null || sessions === undefined) {
		return "N/A";
	}

	const entry = SESSION_LEVEL_MAP.find((item) => item.sessions === sessions);
	return entry ? entry.level : "N/A";
}
