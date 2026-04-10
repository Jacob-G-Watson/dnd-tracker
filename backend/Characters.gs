(function attachCharacters(root) {
  var ALLOWED_CHARACTER_FIELDS = ['class', 'description', 'name', 'race', 'sessions', 'userId'];

  function getBackendSheets() {
    if (root.BackendSheets) {
      return root.BackendSheets;
    }

    if (typeof require !== 'undefined') {
      return require('./Sheets.gs');
    }

    return null;
  }

  function getBackendUtils() {
    if (root.BackendUtils) {
      return root.BackendUtils;
    }

    if (typeof require !== 'undefined') {
      return require('./Utils.gs');
    }

    return null;
  }

  function getCharacters(userId, role) {
    if (getBackendSheets().isDmRole(role)) {
      return getBackendSheets().getAllCharacters();
    }

    return getBackendSheets().getCharactersByUserId(userId);
  }

  function updateCharacter(characterId, updates, userId, role) {
    var character = getBackendSheets().getCharacterById(characterId);
    var sanitizedUpdates = sanitizeCharacterUpdates(updates);

    if (!character) {
      throw getBackendUtils().createError('Character not found');
    }

    ensureCharacterAccess(character, userId, role);

    return getBackendSheets().updateCharacterRecord(characterId, sanitizedUpdates);
  }

  function createCharacter(fields, userId, role) {
    var ownerId = resolveOwnerId(fields, userId, role);
    var sessions = Number(fields.sessions || 0);
    var character = {
      characterId: root.BackendUtils.generateUuid(),
      class: fields.class || '',
      description: fields.description || '',
      name: fields.name || '',
      race: fields.race || '',
      sessions: sessions,
      userId: ownerId
    };

    return getBackendSheets().createCharacterRecord(character);
  }

  function sanitizeCharacterUpdates(updates) {
    var sanitized = {};

    ALLOWED_CHARACTER_FIELDS.forEach(function copyField(fieldName) {
      if (typeof updates[fieldName] !== 'undefined') {
        sanitized[fieldName] = fieldName === 'sessions' ? Number(updates[fieldName]) : updates[fieldName];
      }
    });

    if (typeof sanitized.sessions === 'undefined') {
      throw getBackendUtils().createError('sessions is required for updates');
    }

    return sanitized;
  }

  function resolveOwnerId(fields, userId, role) {
    if (getBackendSheets().isDmRole(role) && fields.userId) {
      return fields.userId;
    }

    return userId;
  }

  function ensureCharacterAccess(character, userId, role) {
    if (getBackendSheets().isDmRole(role)) {
      return;
    }

    if (!isCharacterOwner(character, userId)) {
      throw getBackendUtils().createError('You do not have permission to modify this character');
    }
  }

  function isCharacterOwner(character, userId) {
    return character.userId === userId;
  }

  var exported = {
    createCharacter: createCharacter,
    getCharacters: getCharacters,
    isCharacterOwner: isCharacterOwner,
    sanitizeCharacterUpdates: sanitizeCharacterUpdates,
    updateCharacter: updateCharacter
  };

  root.BackendCharacters = exported;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exported;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);