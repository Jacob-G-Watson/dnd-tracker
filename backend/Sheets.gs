(function attachSheets(root) {
  var SCRIPT_PROPERTY_SHEET_ID = 'SHEET_ID';
  var SHEET_USERS = 'Users';
  var SHEET_CHARACTERS = 'Characters';
  var SHEET_SESSIONS = 'Sessions';
  var ROLE_DM = 'DM';

  function getBackendUtils() {
    if (root.BackendUtils) {
      return root.BackendUtils;
    }

    if (typeof require !== 'undefined') {
      return require('./Utils.gs');
    }

    return null;
  }

  function getSpreadsheet() {
    if (root.__TEST_SPREADSHEET__) {
      return root.__TEST_SPREADSHEET__;
    }

    if (root.SpreadsheetApp.getActiveSpreadsheet) {
      return root.SpreadsheetApp.getActiveSpreadsheet();
    }

    return root.SpreadsheetApp.openById(getSheetId());
  }

  function getSheetId() {
    var properties = root.PropertiesService.getScriptProperties();
    var sheetId = properties.getProperty(SCRIPT_PROPERTY_SHEET_ID);

    if (!sheetId) {
      throw getBackendUtils().createError('Missing SHEET_ID script property');
    }

    return sheetId;
  }

  function getSheet(sheetName) {
    var sheet = getSpreadsheet().getSheetByName(sheetName);

    if (!sheet) {
      throw getBackendUtils().createError('Missing sheet: ' + sheetName);
    }

    return sheet;
  }

  function getRows(sheetName) {
    var values = getSheet(sheetName).getDataRange().getValues();

    if (!values.length) {
      return [];
    }

    return valuesToObjects(values);
  }

  function valuesToObjects(values) {
    var headers = values[0];
    var rows = values.slice(1);

    return rows.filter(hasData).map(function mapRow(row) {
      return buildObject(headers, row);
    });
  }

  function hasData(row) {
    return row.some(function hasCellValue(cellValue) {
      return cellValue !== '' && cellValue !== null && typeof cellValue !== 'undefined';
    });
  }

  function buildObject(headers, row) {
    var objectValue = {};

    headers.forEach(function assignHeader(header, index) {
      objectValue[header] = row[index];
    });

    return objectValue;
  }

  function findFirstBy(sheetName, fieldName, expectedValue) {
    var rows = getRows(sheetName).filter(function matchesValue(row) {
      return row[fieldName] === expectedValue;
    });

    return rows.length ? rows[0] : null;
  }

  function appendObject(sheetName, objectValue) {
    var sheet = getSheet(sheetName);
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var rowValues = headers.map(function mapHeader(header) {
      return typeof objectValue[header] === 'undefined' ? '' : objectValue[header];
    });

    sheet.appendRow(rowValues);
    return objectValue;
  }

  function updateObjectById(sheetName, idFieldName, idValue, updates) {
    var sheet = getSheet(sheetName);
    var values = sheet.getDataRange().getValues();
    var headers = values[0];
    var rowIndex = findRowIndex(values, headers, idFieldName, idValue);

    if (rowIndex === -1) {
      throw getBackendUtils().createError('Record not found');
    }

    headers.forEach(function updateCell(header, index) {
      if (typeof updates[header] !== 'undefined') {
        sheet.getRange(rowIndex + 1, index + 1).setValue(updates[header]);
      }
    });

    return findFirstBy(sheetName, idFieldName, idValue);
  }

  function findRowIndex(values, headers, idFieldName, idValue) {
    var idColumnIndex = headers.indexOf(idFieldName);
    var dataRows = values.slice(1);
    var foundIndex = -1;

    dataRows.some(function matchRow(row, index) {
      if (row[idColumnIndex] === idValue) {
        foundIndex = index + 1;
        return true;
      }

      return false;
    });

    return foundIndex;
  }

  function getUserByEmail(email) {
    return findFirstBy(SHEET_USERS, 'email', email);
  }

  function getUserByUsername(username) {
    return findFirstBy(SHEET_USERS, 'username', username);
  }

  function getUserById(userId) {
    return findFirstBy(SHEET_USERS, 'userId', userId);
  }

  function getCharacterById(characterId) {
    return findFirstBy(SHEET_CHARACTERS, 'characterId', characterId);
  }

  function getCharactersByUserId(userId) {
    return getRows(SHEET_CHARACTERS).filter(function hasOwner(character) {
      return character.userId === userId;
    });
  }

  function getAllCharacters() {
    return getRows(SHEET_CHARACTERS);
  }

  function createCharacterRecord(character) {
    return appendObject(SHEET_CHARACTERS, character);
  }

  function updateCharacterRecord(characterId, updates) {
    return updateObjectById(SHEET_CHARACTERS, 'characterId', characterId, updates);
  }

  function createSessionRecord(session) {
    return appendObject(SHEET_SESSIONS, session);
  }

  function getSessionByToken(token) {
    return findFirstBy(SHEET_SESSIONS, 'token', token);
  }

  function getAllSessions() {
    return getRows(SHEET_SESSIONS);
  }

  function updateSessionRecord(token, updates) {
    return updateObjectById(SHEET_SESSIONS, 'token', token, updates);
  }

  function isDmRole(role) {
    return role === ROLE_DM;
  }

  var exported = {
    SHEET_CHARACTERS: SHEET_CHARACTERS,
    SHEET_SESSIONS: SHEET_SESSIONS,
    SHEET_USERS: SHEET_USERS,
    createCharacterRecord: createCharacterRecord,
    createSessionRecord: createSessionRecord,
    getAllCharacters: getAllCharacters,
    getAllSessions: getAllSessions,
    getCharacterById: getCharacterById,
    getCharactersByUserId: getCharactersByUserId,
    getRows: getRows,
    getSessionByToken: getSessionByToken,
    getSheet: getSheet,
    getUserByEmail: getUserByEmail,
    getUserById: getUserById,
    getUserByUsername: getUserByUsername,
    isDmRole: isDmRole,
    updateCharacterRecord: updateCharacterRecord,
    updateSessionRecord: updateSessionRecord,
    valuesToObjects: valuesToObjects
  };

  root.BackendSheets = exported;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exported;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);