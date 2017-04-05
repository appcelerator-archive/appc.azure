/*
 Welcome to the Azure connector!
 */
var semver = require('semver')

/**
 * Creates the Azure connector for Arrow.
 */
exports.create = function (Arrow) {
  if (semver.lt(Arrow.Version || '0.0.1', '1.2.53')) {
    throw new Error('This connector requires at least version 1.2.53 of Arrow; please run `appc use latest`.')
  }
  var Connector = Arrow.Connector
  var Capabilities = Connector.Capabilities

  return Connector.extend({
    filename: module.filename,
    capabilities: [
      Capabilities.ValidatesConfiguration,
      Capabilities.CanCreate,
      Capabilities.CanRetrieve,
      Capabilities.CanUpdate,
      Capabilities.CanDelete
    ],

    // Looks through a query "where" for $like and $notLike values that can be translated to $regex strings.
    translateWhereRegex: true
  })
}
