var azureStorage = require('azure-storage')
var UUID = require('node-uuid')
var EntGen = azureStorage.TableUtilities.entityGenerator

exports._ensurePrimaryKeySet = function _ensurePrimaryKeySet (entity, fieldTypes) {
  if (undefined === fieldTypes.PartitionKey) {
    entity.PartitionKey = EntGen.String('Default')
  }
  if (undefined === fieldTypes.RowKey) {
    entity.RowKey = EntGen.String(UUID.v4())
  }
}
