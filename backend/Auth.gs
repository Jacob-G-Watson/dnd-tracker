(function attachAuth(root) {
  var GOOGLE_CLIENT_ID_PROPERTY = 'GOOGLE_CLIENT_ID';

  function getBackendSheets() {
    if (root.BackendSheets) {
      return root.BackendSheets;
    }

    if (typeof require !== 'undefined') {
      return require('./Sheets.gs');
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

  function getBackendUtils() {
    if (root.BackendUtils) {
      return root.BackendUtils;
    }

    if (typeof require !== 'undefined') {
      return require('./Utils.gs');
    }

    return null;
  }

  function loginGoogle(idToken) {
    var tokenPayload = verifyGoogleToken(idToken);
    var user = getBackendSheets().getUserByEmail(tokenPayload.email);

    if (!user) {
      throw getBackendUtils().createError('User is not authorized');
    }

    return buildUserSession(user, idToken);
  }

  function loginCustom(username, passwordHash) {
    var user = getBackendSheets().getUserByUsername(username);

    if (!user || user.passwordHash !== passwordHash) {
      throw getBackendUtils().createError('Invalid username or password');
    }

    return buildUserSession(user, getBackendSessions().createSession(user.userId));
  }

  function verifyGoogleToken(idToken) {
    var response = root.UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken));
    var tokenPayload = getBackendUtils().parseJson(response.getContentText());

    if (!isValidAudience(tokenPayload)) {
      throw getBackendUtils().createError('Invalid Google token audience');
    }

    if (!tokenPayload.email) {
      throw getBackendUtils().createError('Google token is missing email');
    }

    return tokenPayload;
  }

  function isValidAudience(tokenPayload) {
    var expectedAudience = root.PropertiesService.getScriptProperties().getProperty(GOOGLE_CLIENT_ID_PROPERTY);
    return Boolean(expectedAudience) && tokenPayload.aud === expectedAudience;
  }

  function buildUserSession(user, token) {
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      token: token,
      userId: user.userId
    };
  }

  var exported = {
    buildUserSession: buildUserSession,
    isValidAudience: isValidAudience,
    loginCustom: loginCustom,
    loginGoogle: loginGoogle,
    verifyGoogleToken: verifyGoogleToken
  };

  root.BackendAuth = exported;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exported;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);