var Arrow = require('arrow')

/**
 * Fetches metadata describing your connector's proper configuration.
 * @param next
 */
exports.fetchMetadata = function fetchMetadata (next) {
  next(null, {
    fields: [
      Arrow.Metadata.Text({
        name: 'azure_account',
        description: 'Azure Account',
        required: true
      }),
      Arrow.Metadata.Text({
        name: 'azure_key',
        description: 'Azure API Key',
        required: true
      })
    ]
  })
}
