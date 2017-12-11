var Arrow = require('arrow')
var azureStorage = require('azure-storage')
var _ = require('lodash')

/**
 * Queries for particular model records.
 * @param {Arrow.Model} Model The model class being updated.
 * @param {ArrowQueryOptions} options Query options.
 * @param {Function} callback Callback passed an Error object (or null if successful) and the model records.
 * @throws {Error} Failed to parse query options.
 */
exports.query = function (Model, options, callback) {
  var self = this
  var query = new azureStorage.TableQuery()

  if (_.isFunction(options)) {
    callback = options
    options = null
  }
  if (!options) {
    options = { where: {} }
  }

  if (options.order || options.skip !== 0 || options.page !== 1 || options.unsel || options.skip) {
    return callback('"order", "skip", "page", and "unsel" are not currently supported by the Azure connector.') // eslint-disable-line standard/no-callback-literal
  }

  var sel = (options.sel && Object.keys(Model.translateKeysForPayload(options.sel))) || Model.payloadKeys()
  if (sel.indexOf('PartitionKey') === -1) { sel.push('PartitionKey') }
  if (sel.indexOf('RowKey') === -1) { sel.push('RowKey') }

  query = query
    .select(sel)
    .top(options.limit)

  var where = options.where
  if (where) {
    where = Model.translateKeysForPayload(where)

    var parts = []
    var values = []

    for (var key in where) {
      parts.push(key + ' == ?')
      values.push(where[key])
    }
    values.unshift(parts.join(' and '))
    query = query.where.apply(query, values)
  }

  this._tableService().queryEntities(this._table(Model),
    query,
    options.continuationToken || null,
    function findAllCallback (error, result) {
      /* istanbul ignore if */
      if (error) {
        return callback(error)
      } else {
        var collection = new Arrow.Collection(Model, result.entries.map(function recordMapper (entity) {
          return self._transformEntityToModel(Model, entity)
        }))
        collection.continuationToken = result.continuationToken
        return callback(null, collection)
      }
    })
}
