var _ = require('lodash'),
	async = require('async'),
	UUID = require('node-uuid'),
	pkginfo = require('pkginfo')(module) && module.exports,
	ModelBindings = require('./modelBindings'),
	azure = require('azure'),
	azureStorage = require('azure-storage'),
	EntGen = azureStorage.TableUtilities.entityGenerator,
	defaultConfig = require('fs').readFileSync(__dirname + '/../conf/example.config.js', 'utf8');

exports.create = function(APIBuilder, server) {
	ModelBindings.listen(APIBuilder);
	var Connector = APIBuilder.Connector,
		Collection = APIBuilder.Collection;

	return Connector.extend({

		/*
		 Configuration.
		 */
		pkginfo: _.pick(pkginfo, 'name', 'version', 'description', 'author', 'license', 'keywords', 'repository'),
		logger: server && server.logger || APIBuilder.createLogger({}, { name: pkginfo.name }),

		/*
		 Lifecycle.
		 */
		connect: function(callback) {
			callback();
		},
		disconnect: function(callback) {
			callback();
		},

		/*
		 Metadata.
		 */
		defaultConfig: defaultConfig,
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

		/*
		 CRUD.
		 */
		create: function(Model, values, callback) {
			var connector = this,
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
					if (error) {
						callback(error);
					}
					else {
						return connector.findOne(Model, entity, callback);
					}
				});
		},
		findAll: function(Model, callback) {
			var query = new azureStorage.TableQuery();
			query = query.top(1000);
			this._tableService().queryEntities(this._table(Model),
				query,
				null,
				function findAllCallback(error, result) {
					if (error) {
						callback(error);
					}
					else {
						var collection = new Collection(Model, result.entries.map(function recordMapper(entity) {
							return this._transformEntityToModel(Model, entity);
						}.bind(this)));
						collection.continuationToken = result.continuationToken;
						callback(null, collection);
					}
				}.bind(this));
		},
		findOne: function(Model, id, callback) {
			id = this._parsePrimaryKey(id);

			var connector = this,
				options = {};
			this._tableService().retrieveEntity(this._table(Model),
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

			if (options.order || options.skip !== 0 || options.page !== 1 || options.unsel || options.skip) {
				return callback('"order", "skip", "page", and "unsel" are not currently supported by the Azure connector.');
			}

			var sel = options.sel && Object.keys(Model.translateKeysForPayload(options.sel)) || Model.payloadKeys();
			if (-1 === sel.indexOf('PartitionKey')) { sel.push('PartitionKey'); }
			if (-1 === sel.indexOf('RowKey')) { sel.push('RowKey'); }

			query = query
				.select(sel)
				.top(options.limit);

			var where = options.where;
			if (where) {
				where = Model.translateKeysForPayload(where);
				var parts = [],
					values = [];
				for (var key in where) {
					parts.push(key + ' == ?');
					values.push(where[key]);
				}
				values.unshift(parts.join(' and '));
				query = query.where.apply(query, values);
			}

			this._tableService().queryEntities(this._table(Model),
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
				payload = instance.toPayload(),
				entity = {},
				options = {},
				fieldTypes = Model.fields;

			if (!this._validateFields(entity, payload, fieldTypes, callback)) {
				return;
			}

			var id = instance.getPrimaryKey();
			entity.PartitionKey = EntGen.String(id.PartitionKey);
			entity.RowKey = EntGen.String(id.RowKey);

			this._tableService().updateEntity(this._table(Model),
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

			this._tableService().deleteEntity(this._table(Model),
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

		/*
		 Other methods.
		 */
		_execute: function(Model, method, opts, callback) {
			var table = this._table(Model),
				tableService = this._tableService();
			tableService[method](table, opts, function(err, result) {
				if (err) {
					callback(err);
				}
				else {
					callback(null, result);
				}
			});
		},

		/*
		 Utilities only used for this connector.
		 */
		_table: function table(Model) {
			var parent = Model;
			while (parent._parent && parent._parent.name) {
				parent = parent._parent;
			}
			var tableName = Model.getMeta('table') || parent.name || Model._supermodel || Model.name;
			if (tableName.indexOf(pkginfo.name + '/') >= 0) {
				tableName = tableName.replace(pkginfo.name + '/', '');
			}
			return tableName;
		},
		_tableService: function tableService() {
			return azure.createTableService(this.config.azure_account, this.config.azure_key);
		},
		_validateFields: function validateFields(entity, values, fieldTypes, callback) {
			for (var key in fieldTypes) {
				if (fieldTypes.hasOwnProperty(key)) {
					var fieldType = fieldTypes[key],
						val = values[key] || fieldType.default,
						type = fieldType.type || 'String';
					// Support object type specifications. 
					if (type.name) { type = type.name; }
					// Ensure upper case.
					type = type.slice(0, 1).toUpperCase() + type.slice(1);
					// Translate to supported types.
					if (type === 'Date') { type = 'DateTime'; }
					if (type === 'Number') { type = 'Int32'; }
					// Ensure we have a valid type.
					if (undefined === EntGen[type]) {
						callback(new TypeError(key + ' was defined with a type of ' + type + ', which is not supported by Azure!'));
						return false;
					}
					// If not undefined, set it.
					if (undefined !== val) { entity[key] = EntGen[type](val); }
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
