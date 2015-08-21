var azureStorage = require('azure-storage'),
	EntGen = azureStorage.TableUtilities.entityGenerator;

/**
 * Deletes the model instance.
 * @param {Arrow.Model} Model The model class being updated.
 * @param {Arrow.Instance} instance Model instance.
 * @param {Function} callback Callback passed an Error object (or null if successful), and the deleted model.
 */
exports['delete'] = function (Model, instance, callback) {
	var options = {},
		id = instance.getPrimaryKey(),
		entityDescriptor = {
			PartitionKey: EntGen.String(id.PartitionKey),
			RowKey: EntGen.String(id.RowKey)
		};

	this._tableService().deleteEntity(this._table(Model),
		entityDescriptor,
		options,
		function deleteCallback(error) {
			/* istanbul ignore if */
			if (error) {
				return callback(error);
			}
			else {
				return callback(null, instance);
			}
		});
};
