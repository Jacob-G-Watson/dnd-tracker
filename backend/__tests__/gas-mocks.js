function createRange(values, setCellValue) {
	return {
		getValues() {
			return values;
		},
		setValue(value) {
			setCellValue(value);
		},
	};
}

function createSheet(initialValues) {
	const values = initialValues.map((row) => row.slice());

	return {
		appendRow(rowValues) {
			values.push(rowValues);
		},
		getDataRange() {
			return createRange(values);
		},
		getLastColumn() {
			return values[0].length;
		},
		getRange(row, column, numberOfRows, numberOfColumns) {
			if (numberOfRows && numberOfColumns) {
				const selectedValues = values
					.slice(row - 1, row - 1 + numberOfRows)
					.map((selectedRow) => selectedRow.slice(column - 1, column - 1 + numberOfColumns));

				return createRange(selectedValues);
			}

			return createRange([[values[row - 1][column - 1]]], (value) => {
				values[row - 1][column - 1] = value;
			});
		},
		values,
	};
}

function createSpreadsheet(sheetMap) {
	return {
		getSheetByName(sheetName) {
			return sheetMap[sheetName] || null;
		},
	};
}

function createScriptCache() {
	const entries = new Map();

	return {
		get(key) {
			return entries.has(key) ? entries.get(key) : null;
		},
		put(key, value) {
			entries.set(key, value);
		},
	};
}

function installGasMocks(overrides = {}) {
	const scriptProperties = new Map(Object.entries(overrides.properties || {}));

	global.Utilities = {
		getUuid: jest.fn().mockReturnValue("123e4567-e89b-12d3-a456-426614174000"),
	};

	global.PropertiesService = {
		getScriptProperties() {
			return {
				getProperty(key) {
					return scriptProperties.get(key) || null;
				},
			};
		},
	};

	global.CacheService = {
		getScriptCache() {
			return overrides.cache || createScriptCache();
		},
	};

	global.UrlFetchApp = {
		fetch: jest.fn().mockImplementation(() => ({
			getContentText() {
				return JSON.stringify(overrides.googleTokenPayload || {});
			},
		})),
	};

	global.ContentService = {
		MimeType: {
			JSON: "application/json",
		},
		createTextOutput(text) {
			return {
				mimeType: null,
				text,
				setMimeType(mimeType) {
					this.mimeType = mimeType;
					return this;
				},
			};
		},
	};

	global.SpreadsheetApp = {
		getActiveSpreadsheet() {
			return overrides.spreadsheet || createSpreadsheet({});
		},
		openById() {
			return overrides.spreadsheet || createSpreadsheet({});
		},
	};

	global.__TEST_SPREADSHEET__ = overrides.spreadsheet || createSpreadsheet({});
}

module.exports = {
	createScriptCache,
	createSheet,
	createSpreadsheet,
	installGasMocks,
};
