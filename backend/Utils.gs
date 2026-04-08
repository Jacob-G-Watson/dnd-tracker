(function attachUtils(root) {
  var TOKEN_PART_COUNT = 2;

  function generateUuid() {
    return root.Utilities.getUuid();
  }

  function generateToken() {
    var tokenParts = [];
    var index = 0;

    for (index = 0; index < TOKEN_PART_COUNT; index += 1) {
      tokenParts.push(generateUuid().replace(/-/g, ''));
    }

    return tokenParts.join('');
  }

  function nowIsoString() {
    return new Date().toISOString();
  }

  function addDaysToIsoString(daysToAdd) {
    var currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + daysToAdd);
    return currentDate.toISOString();
  }

  function parseJson(text) {
    return JSON.parse(text || '{}');
  }

  function stringifyJson(value) {
    return JSON.stringify(value);
  }

  function createError(message) {
    return new Error(message);
  }

  var exported = {
    addDaysToIsoString: addDaysToIsoString,
    createError: createError,
    generateToken: generateToken,
    generateUuid: generateUuid,
    nowIsoString: nowIsoString,
    parseJson: parseJson,
    stringifyJson: stringifyJson
  };

  root.BackendUtils = exported;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exported;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);