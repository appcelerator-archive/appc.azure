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

		Model.createTableIfNotExists = createTableIfNotExists;
	});
};

/**
 * Creates a table if it does not already exist.
 * @param callback
 */
function createTableIfNotExists(callback) {
	var tableName = this.metadata[pkginfo.name] && this.metadata[pkginfo.name].tableName || this.name,
		config = _.defaults({}, this.connector.config, {
			azure_account: process.env.AZURE_ACCOUNT,
			azure_key: process.env.AZURE_KEY
		});
	var tableService = azure.createTableService(config.azure_account, config.azure_key);
	tableService.createTableIfNotExists(tableName, function(err, result) {
		if (err) {
			callback(err);
		}
		else {
			callback(null, result);
		}
	});
}