var APIBuilder = require('apibuilder'),
	_ = require('lodash'),
	async = require('async'),
	UUID = require('node-uuid'),
	pkginfo = require('pkginfo')(module) && module.exports,
	Connector = APIBuilder.Connector,
	Collection = APIBuilder.Collection,
	Instance = APIBuilder.Instance,
	ModelBindings = require('./modelBindings'),
	azureStorage = require('azure-storage'),
	EntGen = azureStorage.TableUtilities.entityGenerator;

module.exports = Connector.extend({

	// generated configuration

	config: APIBuilder.Loader(),
	name: pkginfo.name,
	pkginfo: _.pick(pkginfo, 'name', 'version', 'description', 'author', 'license', 'keywords', 'repository'),
	logger: APIBuilder.createLogger({}, { name: pkginfo.name, useConsole: true, level: 'debug' }),

	// implementation

	constructor: function() {
	},
	fetchConfig: function(next) {
		next(null, this.config);
	},
	fetchMetadata: function(next) {
		next(null, {
			fields: [
				APIBuilder.Metadata.Text({
					name: 'azure_account',
					description: 'Azure Account',
					required: true
				}),
				APIBuilder.Metadata.Text({
					name: 'azure_key',
					description: 'Azure API Key',
					required: true
				})
			]
		});
	},
	fetchSchema: function(next) {
		next();
	},
	loginRequired: function(request, callback) {
		// FIXME -- support per session login
		callback(null, !this.user);
	},
	login: function(request, callback) {
		callback(new Error('Not Yet Implemented!'));
	},
	connect: function(callback) {
		callback();
	},
	disconnect: function(callback) {
		callback();
	},
	create: function(Model, values, callback) {
		var connector = this,
			entity = {},
			options = {},
			fieldTypes = Model.fields;

		// TODO: Extract.
		for (var key in fieldTypes) {
			if (fieldTypes.hasOwnProperty(key)) {
				var fieldType = fieldTypes[key];
				if (fieldType.required && undefined === values[key]) {
					return callback(new TypeError(key + ' is a required parameter!'));
				}
				var val = values[key] || fieldType.default,
					type = fieldType.type || 'String';
				if (undefined === EntGen[type]) {
					return callback(new TypeError(key + ' was defined with an invalid type of ' + type + '!'));
				}
				if (undefined !== val) {
					entity[key] = EntGen[fieldType.type || 'String'](val);
				}
			}
		}
		// TODO: Extract.
		if (undefined === fieldTypes.PartitionKey) {
			entity.PartitionKey = EntGen.String('Default');
		}
		if (undefined === fieldTypes.RowKey) {
			entity.RowKey = EntGen.String(UUID.v4());
		}

		Model.tableService.insertEntity(Model.tableName, entity, options, function createCallback(error) {
			if (error) {
				callback(error);
			}
			else {
				return connector.findOne(Model, entity, callback);
			}
		});
	},
	findOne: function(Model, id, callback) {
		// TODO: Extract.
		if ('string' === typeof id) {
			id = {
				PartitionKey: id.substr(0, id.indexOf('.')),
				RowKey: id.substr(id.indexOf('.') + 1)
			};
		}

		var options = {};
		Model.tableService.retrieveEntity(Model.tableName,
			id.PartitionKey._ || id.PartitionKey,
			id.RowKey._ || id.RowKey,
			options,
			function findOneCallback(error, entity) {
				if (error) {
					callback(error);
				}
				else {
					var result = _.omit(entity, '.metadata');
					for (var key in result) {
						if (result.hasOwnProperty(key)) {
							result[key] = result[key]._;
						}
					}
					var instance = Model.instance(result, true);
					instance.setPrimaryKey({
						PartitionKey: result.PartitionKey,
						RowKey: result.RowKey
					});
					callback(null, instance);
				}
			});
	},
	findAll: function(Model, callback) {
		callback(new Error('Not Yet Implemented!'));
	},
	query: function(Model, query, callback) {
		callback(new Error('Not Yet Implemented!'));
	},
	save: function(Model, instance, callback) {
		callback(new Error('Not Yet Implemented!'));
	},
	'delete': function(Model, instance, callback) {
		var options = {},
			id = instance.getPrimaryKey(),
			entityDescriptor = {
				PartitionKey: EntGen.String(id.PartitionKey),
				RowKey: EntGen.String(id.RowKey)
			};

		Model.tableService.deleteEntity(Model.tableName,
			entityDescriptor,
			options,
			function deleteCallback(error) {
				if (error) {
					callback(error);
				}
				else {
					callback(null, instance);
				}
			});
	},
	deleteAll: function(Model, callback) {
		callback(new Error('Not Yet Implemented!'));
	}

});

ModelBindings.listen();