var should = require('should'),
	APIBuilder = require('apibuilder'),
	config = new APIBuilder.Loader(),
	Connector = require('../lib');

describe('Connector', function() {

	var connector,
		Model;

	before(function(next) {
		should.notEqual(config.azure_account, 'YOUR_AZURE_ACCOUNT', 'Please configure an account and key!');
		should.notEqual(config.azure_key, 'YOUR_AZURE_KEY', 'Please configure an account and key!');
		connector = new Connector();
		Model = APIBuilder.createModel('Car', {
			fields: {
				Make: { type: 'string' },
				Model: { type: 'string' },
				Style: { type: 'string' },
				Year: { type: 'number' },
				Color: { type: 'string' },
				Purchased: { type: 'date' }
			},
			connector: connector
		});
		should(Model).be.ok;

		connector.connect(function(err) {
			should(err).be.not.ok;

			Model.createTableIfNotExists(function(err, result) {
				err ? next(err) : next();
			});
		});
	});
	after(function(next) {
		connector ? connector.disconnect(next) : next();
	});

	it('should be able to create instance', function(next) {
		var object = createObject();
		Model.create(object, function(err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.Object;
			should(instance.getPrimaryKey()).be.a.String;
			should(instance.Make).equal(object.Make);
			should(instance.Year).be.a.Number;
			should(instance.Purchased).be.an.instanceOf(Date);
			instance.delete(next);
		});
	});

	it('should be able to find an instance by ID', function(next) {
		var object = createObject();
		Model.create(object, function(err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.Object;
			var id = instance.getPrimaryKey();
			Model.find(id, function(err, instance2) {
				should(err).be.not.ok;
				should(instance2).be.an.Object;
				should(instance2.getPrimaryKey()).equal(id);
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

	it('should be able to sort, limit, skip while finding', function(next) {
		var limit = 3,
			object = createObject();
		Model.create(object, function(err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.Object;
			var options = {
				where: { Make: object.Make },
				sel: { Id: 1, Make: 1 },
				order: { Id: 1, Make: 1 },
				limit: limit,
				skip: 0
			};
			Model.query(options, function(err, coll) {
				should(err).be.not.ok;
				should(coll.length).be.below(limit + 1);
				shouldContain(coll, instance);
				instance.delete(next);
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
					should(result.getPrimaryKey()).equal(id);
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
			if (instance2.getPrimaryKey() === instance.getPrimaryKey()) {
				found = true;
				should(instance2.Make).equal(instance.Make);
			}
		}
		should(found).be.ok;
	}

});
