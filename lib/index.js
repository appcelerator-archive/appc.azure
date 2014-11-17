var appc = require('appc-cli-core'),
	_ = appc.lodash,
	async = require('async'),
	UUID = require('node-uuid'),
	pkginfo = require('pkginfo')(module) && module.exports,
	ModelBindings = require('./modelBindings'),
	azureStorage = require('azure-storage'),
	EntGen = azureStorage.TableUtilities.entityGenerator;

exports.create = function(APIBuilder, server) {
	var Connector = APIBuilder.Connector,
		Collection = APIBuilder.Collection;

	return Connector.extend({

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

			if (!this._validateFields(entity, values, fieldTypes, callback)) {
				return;
			}
			this._ensurePrimaryKeySet(entity, fieldTypes);

			Model.tableService.insertEntity(Model.table,
				entity,
				options,
				function createCallback(error) {
					if (error) {
						callback(error);
					}
					else {
						return connector.findOne(Model, entity, callback);
					}
				});
		},
		findOne: function(Model, id, callback) {
			id = this._parsePrimaryKey(id);

			var connector = this,
				options = {};
			Model.tableService.retrieveEntity(Model.table,
				id.PartitionKey._ || id.PartitionKey,
				id.RowKey._ || id.RowKey,
				options,
				function findOneCallback(error, entity) {
					if (error) {
						callback(error);
					}
					else {
						callback(null, connector._transformEntityToModel(Model, entity));
					}
				});
		},
		findAll: function(Model, callback) {
			var connector = this;
			Model.tableService.queryEntities(Model.table,
				null,
				null,
				function findAllCallback(error, result) {
					if (error) {
						callback(error);
					}
					else {
						var collection = new Collection(Model, result.entries.map(function recordMapper(entity) {
							return connector._transformEntityToModel(Model, entity);
						}));
						collection.continuationToken = result.continuationToken;
						callback(null, collection);
					}
				});
		},
		query: function(Model, options, callback) {
			var connector = this,
				query = new azureStorage.TableQuery();

			if (_.isFunction(options)) {
				callback = options;
				options = null;
			}
			if (!options) {
				options = { where: {} };
			}

			if (options.sort || options.page || options.unsel || options.per_page || options.skip) {
				return callback('"sort", "skip", "unsel", "page" and "per_page" are not currently supported by the Azure connector.');
			}

			var sel = options.sel && _.keys(options.sel) || Model.keys();
			if (-1 === sel.indexOf('PartitionKey')) { sel.push('PartitionKey'); }
			if (-1 === sel.indexOf('RowKey')) { sel.push('RowKey'); }

			query = query
				.select(sel)
				.top(options.limit || 10);

			if (options.where) {
				var parts = [],
					values = [];
				for (var key in options.where) {
					parts.push(key + ' == ?');
					values.push(options.where[key]);
				}
				values.unshift(parts.join(' and '));
				query = query.where.apply(query, values);
			}

			Model.tableService.queryEntities(Model.table,
				query,
				options.continuationToken || null,
				function findAllCallback(error, result) {
					if (error) {
						callback(error);
					}
					else {
						var collection = new Collection(Model, result.entries.map(function recordMapper(entity) {
							return connector._transformEntityToModel(Model, entity);
						}));
						collection.continuationToken = result.continuationToken;
						callback(null, collection);
					}
				});
		},
		save: function(Model, instance, callback) {
			var connector = this,
				entity = {},
				options = {},
				fieldTypes = Model.fields;

			if (!this._validateFields(entity, instance, fieldTypes, callback)) {
				return;
			}

			var id = instance.getPrimaryKey();
			entity.PartitionKey = EntGen.String(id.PartitionKey);
			entity.RowKey = EntGen.String(id.RowKey);

			Model.tableService.updateEntity(Model.table,
				entity,
				options,
				function saveCallback(error) {
					if (error) {
						callback(error);
					}
					else {
						return connector.findOne(Model, entity, callback);
					}
				});
		},
		'delete': function(Model, instance, callback) {
			var options = {},
				id = instance.getPrimaryKey(),
				entityDescriptor = {
					PartitionKey: EntGen.String(id.PartitionKey),
					RowKey: EntGen.String(id.RowKey)
				};

			Model.tableService.deleteEntity(Model.table,
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
			callback(new Error('deleteAll is not supported by Azure! Please use Model.deleteTable(cb) instead.'));
		},

		//
		// utility
		//
		_validateFields: function validateFields(entity, values, fieldTypes, callback) {
			for (var key in fieldTypes) {
				if (fieldTypes.hasOwnProperty(key)) {
					var fieldType = fieldTypes[key],
						val = values[key] || fieldType.default,
						type = fieldType.type || 'String';
					if (undefined === EntGen[type]) {
						callback(new TypeError(key + ' was defined with a type of ' + type + ', which is not supported by Azure!'));
						return false;
					}
					if (undefined !== val) {
						entity[key] = EntGen[fieldType.type || 'String'](val);
					}
				}
			}
			return true;
		},
		_ensurePrimaryKeySet: function ensurePrimaryKeySet(entity, fieldTypes) {
			if (undefined === fieldTypes.PartitionKey) {
				entity.PartitionKey = EntGen.String('Default');
			}
			if (undefined === fieldTypes.RowKey) {
				entity.RowKey = EntGen.String(UUID.v4());
			}
		},
		_parsePrimaryKey: function parsePrimaryKey(id) {
			if ('string' === typeof id) {
				return {
					PartitionKey: id.substr(0, id.indexOf('.')),
					RowKey: id.substr(id.indexOf('.') + 1)
				};
			}
			return id;
		},
		_transformEntityToModel: function transformEntityToModel(Model, entity) {
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
			return instance;
		}

	});

};

ModelBindings.listen();
