var azure = require('azure');

exports._tableService = function tableService() {
	return azure.createTableService(this.config.azure_account, this.config.azure_key);
};
