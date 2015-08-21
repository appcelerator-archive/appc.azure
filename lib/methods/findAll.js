var azureStorage = require('azure-storage'),
	Arrow = require('arrow');

/**
 * Finds all model instances.  A maximum of 1000 models are returned.
 * @param {Arrow.Model} Model The model class being updated.
 * @param {Function} callback Callback passed an Error object (or null if successful) and the models.
 */
exports.findAll = function (Model, callback) {
	var self = this,
		query = new azureStorage.TableQuery();
	query = query.top(1000);
	this._tableService().queryEntities(this._table(Model),
		query,
		null,
		function findAllCallback(error, result) {
			/* istanbul ignore if */
			if (error) {
				return callback(error);
			}
			else {
				var collection = new Arrow.Collection(Model, result.entries.map(function recordMapper(entity) {
					return self._transformEntityToModel(Model, entity);
				}));
				collection.continuationToken = result.continuationToken;
				return callback(null, collection);
			}
		});
};
