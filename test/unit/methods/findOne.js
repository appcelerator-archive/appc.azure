'use strict'

const test = require('tap').test
const sinon = require('sinon')

const method = require('../../../lib/methods/findOne').findOne

test('### Should call findByID ###', function (t) {
  // Sinon sandbox
  const sandbox = sinon.sandbox.create()

  // Stubs, Spies, Mocks
  const findByIDSpy = sandbox.spy()
  const warnSpy = sandbox.spy()

  // Function call
  method.call({
    findByID: findByIDSpy,
    logger: {
      warn: warnSpy
    }
  })

  setImmediate(function () {
    // Asserts
    t.ok(findByIDSpy.calledOnce)
    t.ok(warnSpy.calledOnce)

    // Restore
    sandbox.restore()

    // End
    t.end()
  })
})
