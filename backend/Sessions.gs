(function attachSessions(root) {
  var SESSION_EXPIRY_DAYS = 30;

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

  function createSession(userId) {
    var session = {
      createdAt: getBackendUtils().nowIsoString(),
      expiresAt: getBackendUtils().addDaysToIsoString(SESSION_EXPIRY_DAYS),
      token: getBackendUtils().generateToken(),
      userId: userId
    };

    getBackendSheets().createSessionRecord(session);
    return session.token;
  }

  function validateSession(token) {
    var session = getBackendSheets().getSessionByToken(token);

    if (!session || isExpiredSession(session.expiresAt)) {
      return null;
    }

    return session.userId;
  }

  function isExpiredSession(expiresAt) {
    return new Date(expiresAt).getTime() <= new Date().getTime();
  }

  function pruneExpiredSessions() {
    return getBackendSheets().getAllSessions().filter(function expiredSession(session) {
      return isExpiredSession(session.expiresAt);
    });
  }

  var exported = {
    SESSION_EXPIRY_DAYS: SESSION_EXPIRY_DAYS,
    createSession: createSession,
    isExpiredSession: isExpiredSession,
    pruneExpiredSessions: pruneExpiredSessions,
    validateSession: validateSession
  };

  root.BackendSessions = exported;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exported;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);