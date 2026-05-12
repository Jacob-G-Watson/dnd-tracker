export const ROLE_PLAYER = "player";
export const ROLE_DUNGEON_MASTER = "dungeonMaster";

export function isDungeonMasterRole(role) {
	return role === ROLE_DUNGEON_MASTER;
}

export function isDungeonMasterUser(user) {
	return Boolean(user && isDungeonMasterRole(user.role));
}
