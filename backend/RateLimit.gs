(function attachRateLimit(root) {
  var MAX_ANON_REQUESTS_PER_MINUTE = 5;
  var MAX_REQUESTS_PER_MINUTE = 30;
  var WINDOW_SIZE_MILLISECONDS = 60000;

  function getBackendUtils() {
    if (root.BackendUtils) {
      return root.BackendUtils;
    }

    if (typeof require !== 'undefined') {
      return require('./Utils.gs');
    }

    return null;
  }

  function checkRateLimit(identifier, endpoint) {
    var cache = root.CacheService.getScriptCache();
    var windowKey = Math.floor(new Date().getTime() / WINDOW_SIZE_MILLISECONDS);
    var normalizedIdentifier = identifier || 'anonymous';
    var cacheKey = ['rl', normalizedIdentifier, endpoint, windowKey].join('_');
    var requestCount = Number(cache.get(cacheKey) || '0') + 1;
    var limit = identifier ? MAX_REQUESTS_PER_MINUTE : MAX_ANON_REQUESTS_PER_MINUTE;

    cache.put(cacheKey, String(requestCount), 60);

    if (requestCount > limit) {
      throw getBackendUtils().createError('Rate limit exceeded. Please wait and try again.');
    }
  }

  var exported = {
    MAX_ANON_REQUESTS_PER_MINUTE: MAX_ANON_REQUESTS_PER_MINUTE,
    MAX_REQUESTS_PER_MINUTE: MAX_REQUESTS_PER_MINUTE,
    checkRateLimit: checkRateLimit
  };

  root.BackendRateLimit = exported;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exported;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);