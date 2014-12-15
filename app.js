var APIBuilder = require('appcelerator').apibuilder,
	server = new APIBuilder(),
	connector = server.getConnector('appc.azure');

// lifecycle examples
server.on('starting', function() {
	server.logger.info('server is starting!');
});

server.on('started', function() {
	server.logger.info('server started!');
});

//--------------------- implement authorization ---------------------//

// fetch our configured apikey
var apikey = server.get('apikey');
server.logger.info('APIKey is:', apikey);

function APIKeyAuthorization(req, resp, next) {
	if (!apikey) {
		return next();
	}
	if (req.headers['apikey']) {
		var key = req.headers['apikey'];
		if (key == apikey) {
			return next();
		}
	}
	resp.status(401);
	return resp.json({
		id: "com.appcelerator.api.unauthorized",
		message: "Unauthorized",
		url: ""
	});
}

//--------------------- simple user model ---------------------//

var Car = APIBuilder.Model.extend('Car', {
	fields: {
		Make: { type: String },
		Model: { type: String },
		Style: { type: String },
		Year: { type: Number },
		Color: { type: String },
		Purchased: { type: Date }
	},
	meta: {
		azure: {
			table: 'Car'
		}
	},
	connector: 'appc.azure'
});

// add an authorization policy for all requests at the server log
server.authorization = APIKeyAuthorization;

// create a user api from a user model
server.addModel(Car);

// start the server
server.start(function(err) {
	if (err) {
		return server.logger.fatal(err);
	}
	server.logger.info('server started on port', server.port);

	Car.createTableIfNotExists(function(err, result) {
		if (err) {
			server.logger.error(err);
		}
		else {
			server.logger.info('Ensured table exists');
		}
	});
});
