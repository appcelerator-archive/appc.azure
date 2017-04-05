'use strict'

const test = require('tap').test
const sinon = require('sinon')
var azureStorage = require('azure-storage')
var Arrow = require('arrow')

const server = require('../../server')
const method = require('../../../lib/methods/findAll').findAll

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

test('### Should return all records ###', function (t) {
  // Sinon sandbox
  const sandbox = sinon.sandbox.create()

  // Stubs, Spies, Mocks
  const topSpy = sinon.spy()
  const tableQueryStub = sandbox.stub(azureStorage, 'TableQuery').returns({
    top: topSpy
  })
  const cbSpy = sandbox.spy()
  const _transformEntityToModelSpy = sandbox.stub(connector, '_transformEntityToModel')
  const queryEntitiesStub = sandbox.stub()
  const _tableServiceStub = sandbox.stub(connector, '_tableService').returns({
    queryEntities: queryEntitiesStub.yieldsAsync(null, { entries: [{}] })
  })
  const _tableStub = sandbox.stub(connector, '_table')
  const collectionStub = sandbox.stub(Arrow, 'Collection')

  // Function call
  method.call(connector, testModel, cbSpy)

  setImmediate(function () {
    // Asserts
    t.ok(cbSpy.calledOnce)
    t.ok(_tableServiceStub.calledOnce)
    t.ok(_tableStub.calledOnce)
    t.ok(topSpy.calledOnce)
    t.ok(topSpy.calledWith(1000))
    t.ok(tableQueryStub.calledOnce)
    t.ok(collectionStub.calledOnce)
    t.ok(_transformEntityToModelSpy.calledOnce)

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
  const topSpy = sinon.spy()
  const tableQueryStub = sandbox.stub(azureStorage, 'TableQuery').returns({
    top: topSpy
  })
  const cbSpy = sandbox.spy()
  const queryEntitiesStub = sandbox.stub()
  const _tableServiceStub = sandbox.stub(connector, '_tableService').returns({
    queryEntities: queryEntitiesStub.yieldsAsync(err)
  })
  const _tableStub = sandbox.stub(connector, '_table')

  // Function call
  method.call(connector, testModel, cbSpy)

  setImmediate(function () {
    // Asserts
    t.ok(cbSpy.calledOnce)
    t.ok(cbSpy.calledWith(err))
    t.ok(_tableServiceStub.calledOnce)
    t.ok(topSpy.calledOnce)
    t.ok(topSpy.calledWith(1000))
    t.ok(tableQueryStub.calledOnce)
    t.ok(_tableStub.calledOnce)

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
