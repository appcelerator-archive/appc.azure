var _ = require('lodash')

exports._transformEntityToModel = function _transformEntityToModel (Model, entity) {
  var result = _.omit(entity, '.metadata')
  for (var key in result) {
    if (result.hasOwnProperty(key)) {
      result[key] = result[key]._
    }
  }
  var instance = Model.instance(result, true)
  instance.setPrimaryKey({
    PartitionKey: result.PartitionKey,
    RowKey: result.RowKey
  })
  return instance
}
