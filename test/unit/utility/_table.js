'use strict'

const test = require('tap').test
const sinon = require('sinon')

const method = require('../../../lib/utility/_table')._table

test('### Should return table name ###', function (t) {
  // Sinon sandbox
  const sandbox = sinon.sandbox.create()

  // Stubs
  const getMetaStub = sandbox.stub().returns(undefined)

  // Function call
  const tableName = method({
    _parent: {
      name: 'Accounts'
    },
    getMeta: getMetaStub
  })

  // Asserts
  t.ok(getMetaStub.calledOnce)
  t.ok(tableName)
  t.equal(tableName, 'Accounts')

  // End
  t.end()
})

test('### Should return table name ###', function (t) {
  // Sinon sandbox
  const sandbox = sinon.sandbox.create()

  // Stubs
  const getMetaStub = sandbox.stub().returns(undefined)

  // Function call
  const tableName = method.call({ name: 'appc.azure' }, {
    _parent: {
      name: 'appc.azure/Accounts'
    },
    getMeta: getMetaStub
  })

  // Asserts
  t.ok(getMetaStub.calledOnce)
  t.ok(tableName)
  t.equal(tableName, 'Accounts')

  // End
  t.end()
})
