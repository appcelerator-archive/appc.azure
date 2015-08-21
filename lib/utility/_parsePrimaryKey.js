exports._parsePrimaryKey = function _parsePrimaryKey(id) {
	if ('string' === typeof id) {
		return {
			PartitionKey: id.substr(0, id.indexOf('.')),
			RowKey: id.substr(id.indexOf('.') + 1)
		};
	}
	return id;
};
