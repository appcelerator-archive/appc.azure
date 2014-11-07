var _ = require('lodash'),
	APIBuilder = require('apibuilder'),
	pkginfo = require('pkginfo')(module) && module.exports,
	azure = require('azure');

exports.listen = function() {
	APIBuilder.Model.on('register', function(Model) {
		// Make sure we only bind our own models.
		if (Model.connector.name !== pkginfo.name) {
			return;
		}

		/**
		 * Creates a new table within a storage account.
		 * @param [opts] The create options. { timeoutIntervalInMs: The optional timeout interval, in milliseconds, to use for the request }
		 * @param callback(error, successful, response) 'error' will contain information if an error occurs; otherwise 'successful' will be true if the operation was successful. 'response' will contain information related to this operation.
		 */
		Model.createTable = curryTableServiceMethod('createTable');
		/**
		 * Creates a new table within a storage account if it doesn't exists.
		 * @param [opts] The create options. { timeoutIntervalInMs: The optional timeout interval, in milliseconds, to use for the request }
		 * @param callback(error, successful, response) 'error' will contain information if an error occurs; otherwise 'successful' will be true if the operation was successful. 'response' will contain information related to this operation.
		 */
		Model.createTableIfNotExists = curryTableServiceMethod('createTableIfNotExists');
		/**
		 * Gets a table properties.
		 * @param [opts] The get options. { timeoutIntervalInMs: The optional timeout interval, in milliseconds, to use for the request }
		 * @param callback(error, successful, response) 'error' will contain information if an error occurs; otherwise 'successful' will be true if the operation was successful. 'response' will contain information related to this operation.
		 */
		Model.getTable = curryTableServiceMethod('getTable');
		/**
		 * Deletes a table from a storage account.
		 * @param [opts] The delete options. { timeoutIntervalInMs: The optional timeout interval, in milliseconds, to use for the request }
		 * @param callback(error, successful, response) 'error' will contain information if an error occurs; otherwise 'successful' will be true if the operation was successful. 'response' will contain information related to this operation.
		 */
		Model.deleteTable = curryTableServiceMethod('deleteTable');
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
		var tableName = getTableName(this),
			tableService = getTableService(this);
		tableService[method](tableName, opts, function(err, result) {
			if (err) {
				callback(err);
			}
			else {
				callback(null, result);
			}
		});
	};
}

/*
 Utility.
 */

function getTableName(context) {
	return context.metadata[pkginfo.name] && context.metadata[pkginfo.name].tableName || context.name;
}

function getTableService(context) {
	var config = _.defaults({}, context.connector.config, {
		azure_account: process.env.AZURE_ACCOUNT,
		azure_key: process.env.AZURE_KEY
	});
	return azure.createTableService(config.azure_account, config.azure_key);
}