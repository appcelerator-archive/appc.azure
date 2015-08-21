var azureStorage = require('azure-storage'),
	UUID = require('node-uuid'),
	EntGen = azureStorage.TableUtilities.entityGenerator;

exports._ensurePrimaryKeySet = function _ensurePrimaryKeySet(entity, fieldTypes) {
	if (undefined === fieldTypes.PartitionKey) {
		entity.PartitionKey = EntGen.String('Default');
	}
	if (undefined === fieldTypes.RowKey) {
		entity.RowKey = EntGen.String(UUID.v4());
	}
};
