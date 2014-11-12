var should = require('should'),
	assert = require('assert'),
	APIBuilder = require('apibuilder'),
	config = new APIBuilder.Loader(),
	Connector = require('../lib');

describe('Connector', function() {

	var connector,
		Model;

	before(function(next) {
		var self = this;
		should.notEqual(config.azure_account, 'YOUR_AZURE_ACCOUNT', 'Please configure an account and key!');
		should.notEqual(config.azure_key, 'YOUR_AZURE_KEY', 'Please configure an account and key!');
		connector = new Connector();
		Model = APIBuilder.createModel('Car', {
			fields: {
				Make: { type: 'String' },
				Model: { type: 'String' },
				Style: { type: 'String' },
				Year: { type: 'Int32' },
				Color: { type: 'String' },
				Purchased: { type: 'DateTime' }
			},
			meta: {
				azure: {
					tableName: 'CarTest'
				}
			},
			connector: connector
		});
		should(Model).be.ok;

		connector.connect(function connectCallback(err) {
			should(err).be.not.ok;

			Model.createTableIfNotExists(function(err, result) {
				if (err && String(err).indexOf('The specified table is being deleted. Try operation later') >= 0) {
					self.timeout(2 * 60 * 1000);
					console.log('delaying create table until last test run finishes cleaning up...');
					return setTimeout(connectCallback, 10000);
				}

				should(err).be.not.ok;
				next();
			});
		});
	});
	after(function(next) {
		Model.deleteTable(function(err, result) {
			should(err).be.not.ok;
			connector ? connector.disconnect(next) : next();
		});
	});

	it('should be able to create instance', function(next) {
		var object = createObject();
		Model.create(object, function(err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.Object;
			should(instance.getPrimaryKey()).be.an.Object;
			should(instance.Make).equal(object.Make);
			should(instance.Year).be.a.Number;
			should(instance.Purchased).be.an.instanceOf(Date);
			instance.delete(next);
		});
	});

	it('should be able to find all', function(next) {
		var object = createObject();
		Model.create(object, function(err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.Object;
			Model.findAll(function(err, coll) {
				should(err).be.not.ok;
				shouldContain(coll, instance);
				instance.delete(next);
			});
		});
	});

	it('should be able to find an instance by ID', function(next) {
		var object = createObject();
		Model.create(object, function(err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.Object;
			var id = instance.getPrimaryKey();
			Model.findOne(id, function(err, instance2) {
				should(err).be.not.ok;
				should(instance2).be.an.Object;
				assert.deepEqual(instance.getPrimaryKey(), instance2.getPrimaryKey());
				should(instance2.getPrimaryKey()).be.an.Object;
				should(instance2.Make).equal(object.Make);
				instance.delete(next);
			});
		});
	});

	it('should be able to find an instance by field value', function(next) {
		var object = createObject();
		Model.create(object, function(err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.Object;
			var options = { Make: object.Make };
			Model.find(options, function(err, coll) {
				should(err).be.not.ok;
				shouldContain(coll, instance);
				instance.delete(next);
			});
		});
	});

	it('should be able to sel, limit while finding', function(next) {
		var limit = 1,
			object = createObject();
		Model.create(object, function(err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.Object;
			Model.create(object, function(err, instance) {
				should(err).be.not.ok;
				should(instance).be.an.Object;
				var options = {
					where: { Make: object.Make },
					sel: { Make: 1 },
					limit: limit
				};
				Model.query(options, function(err, coll) {
					should(err).be.not.ok;
					should(coll.length).be.below(limit + 1);
					should(coll.continuationToken).be.ok;
					instance.delete(next);
				});
			});
		});
	});

	it('should be able to update an instance', function(next) {
		var object = createObject();
		Model.create(object, function(err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.Object;
			var id = instance.getPrimaryKey();
			Model.findOne(id, function(err, instance2) {
				should(err).be.not.ok;
				var newMake = 'Toyota';
				instance2.set('Make', newMake);
				instance2.save(function(err, result) {
					should(err).be.not.ok;
					should(result).be.an.Object;
					assert.deepEqual(instance.getPrimaryKey(), instance2.getPrimaryKey());
					should(result.Make).equal(newMake);
					instance.delete(next);
				});
			});
		});
	});

	/*
	 Utility.
	 */

	function createObject() {
		return {
			Make: 'Honda',
			Model: 'Accord',
			Style: 'EX-L',
			Year: 2006,
			Color: 'Brown',
			Purchased: new Date(2012, 7, 15, 14, 53, 0)
		};
	}

	function shouldContain(coll, instance) {
		should(coll).be.an.object;
		should(coll.length).be.above(0);
		var found = false;
		for (var i = 0; i < coll.length; i++) {
			var instance2 = coll[i];
			if (JSON.stringify(instance2.getPrimaryKey()) === JSON.stringify(instance.getPrimaryKey())) {
				found = true;
				should(instance2.Make).equal(instance.Make);
			}
		}
		should(found).be.ok;
	}

});
