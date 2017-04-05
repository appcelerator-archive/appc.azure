'use strict'

const test = require('tap').test
const sinon = require('sinon')

const server = require('../../server')
const method = require('../../../lib/methods/findByID').findByID

var arrow
var connector
var testModel

test('### Start Arrow ###', function (t) {
  server()
    .then((inst) => {
      arrow = inst

      // Set-up
      connector = arrow.getConnector('appc.azure')
      testModel = arrow.getModel('Car')

      t.ok(arrow, 'Arrow has been started')
      t.end()
    })
    .catch(t.threw)
})

test('### Should return a record ###', function (t) {
  // Sinon sandbox
  const sandbox = sinon.sandbox.create()

  // Stubs, Spies, Mocks
  const _parsePrimaryKeyStub = sandbox.stub(connector, '_parsePrimaryKey').returns({
    PartitionKey: {},
    RowKey: {}
  })
  const cbSpy = sandbox.spy()
  const retrieveEntityStub = sandbox.stub()
  const _tableServiceStub = sandbox.stub(connector, '_tableService').returns({
    retrieveEntity: retrieveEntityStub.yieldsAsync()
  })
  const _tableStub = sandbox.stub(connector, '_table')
  const _transformEntityToModelStub = sandbox.stub(connector, '_transformEntityToModel')

  // Function call
  method.call(connector, testModel, 5, cbSpy)

  setImmediate(function () {
    // Asserts
    t.ok(cbSpy.calledOnce)
    t.ok(_tableServiceStub.calledOnce)
    t.ok(_tableStub.calledOnce)
    t.ok(_parsePrimaryKeyStub.calledOnce)
    t.ok(_transformEntityToModelStub.calledOnce)

    // Restore
    sandbox.restore()

    // End
    t.end()
  })
})

test('### Should return an error ###', function (t) {
  // Sinon sandbox
  const sandbox = sinon.sandbox.create()

  // Error
  const err = new Error('Fail')

  // Stubs, Spies, Mocks
  const _parsePrimaryKeyStub = sandbox.stub(connector, '_parsePrimaryKey').returns({
    PartitionKey: {},
    RowKey: {}
  })
  const cbSpy = sandbox.spy()
  const retrieveEntityStub = sandbox.stub()
  const _tableServiceStub = sandbox.stub(connector, '_tableService').returns({
    retrieveEntity: retrieveEntityStub.yieldsAsync(err)
  })
  const _tableStub = sandbox.stub(connector, '_table')

  // Function call
  method.call(connector, testModel, 5, cbSpy)

  setImmediate(function () {
    // Asserts
    t.ok(cbSpy.calledOnce)
    t.ok(cbSpy.calledWith(err))
    t.ok(_tableServiceStub.calledOnce)
    t.ok(_tableStub.calledOnce)
    t.ok(_parsePrimaryKeyStub.calledOnce)

    // Restore
    sandbox.restore()

    // End
    t.end()
  })
})

test('### Stop Arrow ###', function (t) {
  arrow.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
