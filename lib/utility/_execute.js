exports._execute = function (Model, method, opts, callback) {
  var table = this._table(Model)
  var tableService = this._tableService()

  tableService[method](table, opts, callback)
}
