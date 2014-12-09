var _ = require('lodash'),
	pkginfo = require('pkginfo')(module) && module.exports,
	azure = require('azure');

exports.listen = function(APIBuilder) {
	APIBuilder.Model.on('register', function(Model) {
		// Make sure we only bind our own models.
		if (Model.connector.name !== pkginfo.name) {
			return;
		}

		var bindings = {
			/**
			 * Retrieves the Azure table name for this model.
			 */
			get table() {
				return Model.metadata[pkginfo.name] && Model.metadata[pkginfo.name].table || Model.name;
			},
			/**
			 * Retrieves the Azure table service for this model.
			 */
			get tableService() {
				var config = _.defaults({}, Model.connector.config, {
					azure_account: process.env.AZURE_ACCOUNT,
					azure_key: process.env.AZURE_KEY
				});
				return azure.createTableService(config.azure_account, config.azure_key);
			},
			/**
			 * Creates a new table within a storage account.
			 * @param [opts] The create options. { timeoutIntervalInMs: The optional timeout interval, in milliseconds, to use for the request }
			 * @param callback(error, successful, response) 'error' will contain information if an error occurs; otherwise 'successful' will be true if the operation was successful. 'response' will contain information related to this operation.
			 */
			createTable: curryTableServiceMethod('createTable'),
			/**
			 * Creates a new table within a storage account if it doesn't exists.
			 * @param [opts] The create options. { timeoutIntervalInMs: The optional timeout interval, in milliseconds, to use for the request }
			 * @param callback(error, successful, response) 'error' will contain information if an error occurs; otherwise 'successful' will be true if the operation was successful. 'response' will contain information related to this operation.
			 */
			createTableIfNotExists: curryTableServiceMethod('createTableIfNotExists'),
			/**
			 * Gets a table properties.
			 * @param [opts] The get options. { timeoutIntervalInMs: The optional timeout interval, in milliseconds, to use for the request }
			 * @param callback(error, successful, response) 'error' will contain information if an error occurs; otherwise 'successful' will be true if the operation was successful. 'response' will contain information related to this operation.
			 */
			getTable: curryTableServiceMethod('getTable'),
			/**
			 * Deletes a table from a storage account.
			 * @param [opts] The delete options. { timeoutIntervalInMs: The optional timeout interval, in milliseconds, to use for the request }
			 * @param callback(error, successful, response) 'error' will contain information if an error occurs; otherwise 'successful' will be true if the operation was successful. 'response' will contain information related to this operation.
			 */
			deleteTable: curryTableServiceMethod('deleteTable')
		};

		for (var key in bindings) {
			if (bindings.hasOwnProperty(key)) {
				Model[key] = bindings[key];
			}
		}

	});
};

/**
 * Creates a function that will call the specified table service method, handling the response properly.
 * @param method
 * @returns {Function}
 */
function curryTableServiceMethod(method) {
	return function tableServiceMethod(opts, callback) {
		if (_.isFunction(opts)) {
			callback = opts;
			opts = {};
		}
		var table = this.table,
			tableService = this.tableService;
		tableService[method](table, opts, function(err, result) {
			if (err) {
				callback(err);
			}
			else {
				callback(null, result);
			}
		});
	};
}