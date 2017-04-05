/**
 * NOTE: This file is simply for testing this connector and will not
 * be used or packaged with the actual connector when published.
 */
var Arrow = require('arrow')
var server = new Arrow()

var Car = Arrow.Model.extend('Car', {
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
})
server.addModel(Car)

server.start(function (err) {
  if (err) {
    return server.logger.fatal(err)
  }
  server.logger.info('server started on port', server.port)

  Car.createTableIfNotExists(function (err, result) {
    if (err) {
      server.logger.error(err)
    } else {
      server.logger.info('Ensured table exists')
    }
  })
})
