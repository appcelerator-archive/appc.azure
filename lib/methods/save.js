var azureStorage = require('azure-storage'),
	EntGen = azureStorage.TableUtilities.entityGenerator;

/**
 * Updates a Model instance.
 * @param {Arrow.Model} Model The model class being updated.
 * @param {Arrow.Instance} instance Model instance to update.
 * @param {Function} callback Callback passed an Error object (or null if successful) and the updated model.
 */
exports.save = function (Model, instance, callback) {
	var self = this,
		payload = instance.toPayload(),
		entity = {},
		options = {},
		fieldTypes = Model.fields;

	if (!this._validateFields(entity, payload, fieldTypes, callback)) {
		return;
	}

	var id = instance.getPrimaryKey();
	entity.PartitionKey = EntGen.String(id.PartitionKey);
	entity.RowKey = EntGen.String(id.RowKey);

	this._tableService().updateEntity(this._table(Model),
		entity,
		options,
		function saveCallback(error) {
			/* istanbul ignore if */
			if (error) {
				return callback(error);
			}
			else {
				return self.findByID(Model, entity, callback);
			}
		});
};
