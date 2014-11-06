var APIBuilder = require('apibuilder'),
	_ = require('lodash'),
	async = require('async'),
	pkginfo = require('pkginfo')(module) && module.exports,
	Connector = APIBuilder.Connector,
	Collection = APIBuilder.Collection,
	Instance = APIBuilder.Instance,
	ModelBindings = require('./modelBindings');

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
	findOne: function(Model, id, callback) {
		callback(new Error('Not Yet Implemented!'));
	},
	findAll: function(Model, callback) {
		callback(new Error('Not Yet Implemented!'));
	},
	query: function(Model, query, callback) {
		callback(new Error('Not Yet Implemented!'));
	},
	create: function(Model, values, callback) {
		callback(new Error('Not Yet Implemented!'));
	},
	save: function(Model, instance, callback) {
		callback(new Error('Not Yet Implemented!'));
	},
	'delete': function(Model, instance, callback) {
		callback(new Error('Not Yet Implemented!'));
	},
	deleteAll: function(Model, callback) {
		callback(new Error('Not Yet Implemented!'));
	}

});

ModelBindings.listen();