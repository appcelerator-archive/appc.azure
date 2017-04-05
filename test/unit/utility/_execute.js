'use strict'

const test = require('tap').test
const sinon = require('sinon')

const method = require('../../../lib/utility/_execute')._execute

test('### Should execute a method ###', function (t) {
  // Sinon sandbox
  const sandbox = sinon.sandbox.create()

  // Spies
  const _tableSpy = sandbox.spy()
  const findByIDSpy = sandbox.spy()
  const _tableServiceStub = sandbox.stub().returns({
    findByID: findByIDSpy
  })

  // Function call
  method.call({
    _table: _tableSpy,
    _tableService: _tableServiceStub
  }, {}, 'findByID', {}, () => {})

  // Asserts
  t.ok(_tableSpy.calledOnce)
  t.ok(_tableServiceStub.calledOnce)
  t.ok(findByIDSpy.calledOnce)

  // Restore
  sandbox.restore()

  // End
  t.end()
})
