if (!process.env.AZURE_ACCOUNT || !process.env.AZURE_KEY) {
	throw new Error('The environment variables "AZURE_ACCOUNT" and "AZURE_KEY" must be set!');
}

var azure = require('azure'),
	Features = require('./features');

/**
 * Shows block information and prints options content.
 * @param req
 * @param res
 */
exports.run = function(req, res) {
	res.send(200, {
		block: 'Mobware Azure',
		options: {
			method: req.method,
			headers: req.headers,
			query: req.query,
			body: req.body,
			cookie: req.cookies,
			files: req.files,
			params: req.params,
			config: req.config
		}
	});
};

Object.keys(Features).forEach(function(Feature) {
	Object.keys(Features[Feature]).forEach(function(MethodName) {
		var Namespace = Features[Feature][MethodName];
		exports[Feature + '.' + MethodName] = defineEndpoint(Namespace, MethodName);
	});
});

function defineEndpoint(Namespace, MethodName) {
	return function(req, res) {
		var service = azure[Namespace](process.env.AZURE_ACCOUNT, process.env.AZURE_KEY),
			args = [];

		if (req.body && req.body.tableName) {
			// TODO: We have to translate arguments from a dictionary to an array.
			args.push(req.body.tableName);
		}

		args.push(function(err, response) {
			if (err) {
				res.send(500, err);
			} else {
				res.send(200, response);
			}
		});

		service[MethodName].apply(service, args);
	};
}