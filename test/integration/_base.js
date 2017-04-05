/* global before, after */
var Arrow = require('arrow')
var server = new Arrow()
var connector = server.getConnector('appc.azure')

exports.Arrow = Arrow
exports.server = server
exports.connector = connector

before(function (cb) {
  server.start(cb)
})

after(function (cb) {
  server.stop(cb)
})
