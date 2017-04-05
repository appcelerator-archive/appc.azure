exports._table = function _table (Model) {
  var parent = Model
  while (parent._parent && parent._parent.name) {
    parent = parent._parent
  }
  var tableName = Model.getMeta('table') || parent.name || Model._supermodel || Model.name
  if (tableName.indexOf(this.name + '/') >= 0) {
    tableName = tableName.replace(this.name + '/', '')
  }
  return tableName
}
