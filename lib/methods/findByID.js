/**
 * Finds a model instance using the primary key.
 * @param {Arrow.Model} Model The model class being updated.
 * @param {String} id ID of the model to find.
 * @param {Function} callback Callback passed an Error object (or null if successful) and the found model.
 */
exports.findByID = function (Model, id, callback) {
	id = this._parsePrimaryKey(id);

	var self = this,
		options = {};
	this._tableService().retrieveEntity(this._table(Model),
		id.PartitionKey._ || id.PartitionKey,
		id.RowKey._ || id.RowKey,
		options,
		function findByIDCallback(error, entity) {
			/* istanbul ignore if */
			if (error) {
				return callback(error);
			}
			else {
				return callback(null, self._transformEntityToModel(Model, entity));
			}
		});
};
