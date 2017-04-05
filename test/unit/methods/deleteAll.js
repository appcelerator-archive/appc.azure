'use strict'

const test = require('tap').test
const sinon = require('sinon')

const method = require('../../../lib/methods/deleteAll').deleteAll

test('### Should return an error ###', function (t) {
  // Sinon sandbox
  const sandbox = sinon.sandbox.create()

  // Stubs, Spies, Mocks
  const cbSpy = sandbox.spy()

  // Function call
  method({}, cbSpy)

  setImmediate(function () {
    // Asserts
    t.ok(cbSpy.calledOnce)

    // Restore
    sandbox.restore()

    // End
    t.end()
  })
})
