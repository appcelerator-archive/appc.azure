var azureStorage = require('azure-storage'),
	EntGen = azureStorage.TableUtilities.entityGenerator;

exports._validateFields = function _validateFields(entity, values, fieldTypes, callback) {
	for (var key in fieldTypes) {
		if (fieldTypes.hasOwnProperty(key)) {
			var fieldType = fieldTypes[key],
				val = values[key] || fieldType.default,
				type = fieldType.type || 'String';
			// Support object type specifications. 
			if (type.name) { type = type.name; }
			// Ensure upper case.
			type = type.slice(0, 1).toUpperCase() + type.slice(1);
			// Translate to supported types.
			if (type === 'Date') { type = 'DateTime'; }
			if (type === 'Number') { type = 'Int32'; }
			// Ensure we have a valid type.
			if (undefined === EntGen[type]) {
				callback(new TypeError(key + ' was defined with a type of ' + type + ', which is not supported by Azure!'));
				return false;
			}
			// If not undefined, set it.
			if (undefined !== val) { entity[key] = EntGen[type](val); }
		}
	}
	return true;
};
