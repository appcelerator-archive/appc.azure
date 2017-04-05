'use strict'

const test = require('tap').test
const sinon = require('sinon')

const azureStorage = require('azure-storage')
const UUID = require('node-uuid')
const method = require('../../../lib/utility/_ensurePrimaryKeySet')._ensurePrimaryKeySet

test('### Should ensure primary key set ###', function (t) {
  // Sinon sandbox
  const sandbox = sinon.sandbox.create()

  // Stubs, Spies, Mocks
  const entGenStub = sandbox.stub(azureStorage.TableUtilities.entityGenerator, 'String').returns('test')
  const UUIDStub = sandbox.stub(UUID, 'v4')

  //  Test data
  const entity = {}

  // Function call
  method(entity, {})

  // Asserts
  t.ok(entGenStub.calledTwice)
  t.ok(UUIDStub.calledOnce)
  t.ok(entity.RowKey)
  t.ok(entity.PartitionKey)

  // Restore
  sandbox.restore()

  // End
  t.end()
})
