'use strict'

const test = require('tap').test
const sinon = require('sinon')

const azure = require('azure')
const method = require('../../../lib/utility/_tableService')._tableService

test('### Should create table service ###', function (t) {
  // Sinon sandbox
  const sandbox = sinon.sandbox.create()

  // Test data
  const data = {}

  // Stubs
  const createTableServiceStub = sandbox.stub(azure, 'createTableService').returns(data)

  // Function call
  const tableService = method.call({
    config: {
      azure_account: 'xxx',
      azure_key: 'yyy'
    }
  })

  // Asserts
  t.ok(createTableServiceStub.calledOnce)
  t.ok(createTableServiceStub.calledWith('xxx', 'yyy'))
  t.ok(tableService)
  t.equal(tableService, data)

  // End
  t.end()
})
