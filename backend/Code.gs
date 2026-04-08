(function attachCode(root) {
  var ACTION_LOGIN_CUSTOM = 'loginCustom';
  var ACTION_LOGIN_GOOGLE = 'loginGoogle';
  var ACTION_GET_CHARACTERS = 'getCharacters';
  var ACTION_UPDATE_CHARACTER = 'updateCharacter';
  var ACTION_CREATE_CHARACTER = 'createCharacter';

  function getBackendAuth() {
    if (root.BackendAuth) {
      return root.BackendAuth;
    }

    if (typeof require !== 'undefined') {
      return require('./Auth.gs');
    }

    return null;
  }

  function getBackendCharacters() {
    if (root.BackendCharacters) {
      return root.BackendCharacters;
    }

    if (typeof require !== 'undefined') {
      return require('./Characters.gs');
    }

    return null;
  }

  function getBackendRateLimit() {
    if (root.BackendRateLimit) {
      return root.BackendRateLimit;
    }

    if (typeof require !== 'undefined') {
      return require('./RateLimit.gs');
    }

    return null;
  }

  function getBackendSessions() {
    if (root.BackendSessions) {
      return root.BackendSessions;
    }

    if (typeof require !== 'undefined') {
      return require('./Sessions.gs');
    }

    return null;
  }

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

  function doPost(event) {
    try {
      var body = getBackendUtils().parseJson(event.postData.contents);
      var authenticatedUser = resolveAuthenticatedUser(body);
      var identifier = authenticatedUser ? authenticatedUser.userId : null;

      getBackendRateLimit().checkRateLimit(identifier, body.action || 'unknown');
      return buildSuccessResponse(routeAction(body.action, body, authenticatedUser));
    } catch (error) {
      return buildErrorResponse(error.message);
    }
  }

  function resolveAuthenticatedUser(body) {
    if (body.action === ACTION_LOGIN_CUSTOM || body.action === ACTION_LOGIN_GOOGLE) {
      return null;
    }

    if (body.googleIdToken) {
      return getBackendAuth().loginGoogle(body.googleIdToken);
    }

    if (body.token) {
      return buildUserFromSession(body.token);
    }

    throw getBackendUtils().createError('Authentication is required');
  }

  function buildUserFromSession(token) {
    var userId = getBackendSessions().validateSession(token);
    var user = getBackendSheets().getUserById(userId);

    if (!userId || !user) {
      throw getBackendUtils().createError('Invalid or expired session');
    }

    return getBackendAuth().buildUserSession(user, token);
  }

  function routeAction(action, body, authenticatedUser) {
    if (action === ACTION_LOGIN_CUSTOM) {
      return getBackendAuth().loginCustom(body.username, body.passwordHash);
    }

    if (action === ACTION_LOGIN_GOOGLE) {
      return getBackendAuth().loginGoogle(body.idToken);
    }

    if (action === ACTION_GET_CHARACTERS) {
      return getBackendCharacters().getCharacters(authenticatedUser.userId, authenticatedUser.role);
    }

    if (action === ACTION_UPDATE_CHARACTER) {
      return getBackendCharacters().updateCharacter(
        body.characterId,
        body.updates,
        authenticatedUser.userId,
        authenticatedUser.role
      );
    }

    if (action === ACTION_CREATE_CHARACTER) {
      return getBackendCharacters().createCharacter(body.character, authenticatedUser.userId, authenticatedUser.role);
    }

    throw getBackendUtils().createError('Unknown action');
  }

  function buildSuccessResponse(data) {
    return createJsonResponse({
      data: data,
      ok: true
    });
  }

  function buildErrorResponse(message) {
    return createJsonResponse({
      message: message,
      ok: false
    });
  }

  function createJsonResponse(payload) {
    return root.ContentService
      .createTextOutput(getBackendUtils().stringifyJson(payload))
      .setMimeType(root.ContentService.MimeType.JSON);
  }

  root.doPost = doPost;

  var exported = {
    buildErrorResponse: buildErrorResponse,
    buildSuccessResponse: buildSuccessResponse,
    doPost: doPost,
    resolveAuthenticatedUser: resolveAuthenticatedUser,
    routeAction: routeAction
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exported;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);