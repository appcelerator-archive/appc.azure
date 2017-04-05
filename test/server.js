'use strict'

const Arrow = require('arrow')

module.exports = function (options) {
  return new Promise((resolve, reject) => {
    options = options || {}
    const arrow = new Arrow({}, true)
    const connector = arrow.getConnector('appc.azure')

    // Create test model - Car
    arrow.addModel(Arrow.createModel('Car', {
      connector,
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
      }
    }))

    // Return the arrow instance
    resolve(arrow)
  })
}
