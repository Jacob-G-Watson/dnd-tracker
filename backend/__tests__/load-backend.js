function loadBackend() {
	const orderedModules = [
		["utils", "../Utils.gs"],
		["sheets", "../Sheets.gs"],
		["sessions", "../Sessions.gs"],
		["rateLimit", "../RateLimit.gs"],
		["auth", "../Auth.gs"],
		["characters", "../Characters.gs"],
		["code", "../Code.gs"],
	];
	const loadedModules = {};

	global.BackendUtils = undefined;
	global.BackendSheets = undefined;
	global.BackendSessions = undefined;
	global.BackendRateLimit = undefined;
	global.BackendAuth = undefined;
	global.BackendCharacters = undefined;

	orderedModules.forEach(([moduleName, modulePath]) => {
		delete require.cache[require.resolve(modulePath)];
		loadedModules[moduleName] = require(modulePath);
	});

	return loadedModules;
}

module.exports = {
	loadBackend,
};
