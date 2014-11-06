var azure = require('azure'),
	APIBuilder = require('apibuilder'),
	config = new APIBuilder.Loader(),
	_ = require('lodash');

module.exports = {
	StorageBlob: enumerate('Blob'),
	StorageTable: enumerate('Table'),
	StorageQueue: enumerate('Queue'),
	ServiceBus: enumerate('ServiceBus')
};

function enumerate(name) {
	var retVal = {},
		service = azure['create' + name + 'Service'](config.azure_account, config.azure_key);
	for (var key in service) {
		if (_.isFunction(service[key]) && key[0] !== '_') {
			retVal[key] = 'create' + name + 'Service';
		}
	}
	return retVal;
}