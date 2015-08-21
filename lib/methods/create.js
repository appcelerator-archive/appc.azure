/**
 * Creates a new Model or Collection object.
 * @param {Arrow.Model} Model The model class being updated.
 * @param {Array<Object>/Object} [values] Attributes to set on the new model(s).
 * @param {Function} callback Callback passed an Error object (or null if successful), and the new model or collection.
 * @throws {Error}
 */
exports.create = function (Model, values, callback) {
	var self = this,
		payload = Model.instance(values, false).toPayload(),
		entity = {},
		options = {},
		fieldTypes = Model.fields;

	if (!this._validateFields(entity, payload, fieldTypes, callback)) {
		return;
	}
	this._ensurePrimaryKeySet(entity, fieldTypes);

	this._tableService().insertEntity(this._table(Model),
		entity,
		options,
		function createCallback(error) {
			/* istanbul ignore if */
			if (error) {
				return callback(error);
			}
			else {
				return self.findOne(Model, entity, callback);
			}
		});
};
