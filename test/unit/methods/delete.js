'use strict'

const test = require('tap').test
const sinon = require('sinon')

const server = require('../../server')
const azureStorage = require('azure-storage')

var arrow
var connector
var testModel
var method
var entGenStub

test('### Start Arrow ###', function (t) {
  server()
    .then((inst) => {
      arrow = inst

      // Set-up
      connector = arrow.getConnector('appc.azure')
      testModel = arrow.getModel('Car')

      // Stubs
      entGenStub = sinon.stub(azureStorage.TableUtilities.entityGenerator, 'String')

      // Method
      method = require('../../../lib/methods/delete').delete

      t.ok(arrow, 'Arrow has been started')
      t.end()
    })
    .catch(t.threw)
})

test('### Should delete a record ###', function (t) {
  // Sinon sandbox
  const sandbox = sinon.sandbox.create()

  // Fake model's instance
  const fakeInst = {
    getPrimaryKey: sandbox.stub().returns({})
  }

  // Stubs, Spies, Mocks
  const cbSpy = sandbox.spy()
  const deleteEntityStub = sandbox.stub()
  const _tableServiceStub = sandbox.stub(connector, '_tableService').returns({
    deleteEntity: deleteEntityStub.yieldsAsync()
  })
  const _tableStub = sandbox.stub(connector, '_table')

  // Function call
  method.call(connector, testModel, fakeInst, cbSpy)

  setImmediate(function () {
    // Asserts
    t.ok(cbSpy.calledOnce)
    t.ok(fakeInst.getPrimaryKey.calledOnce)
    t.ok(_tableServiceStub.calledOnce)
    t.ok(entGenStub.calledTwice)
    t.ok(_tableStub.calledOnce)

    // Restore
    sandbox.restore()
    // Reset
    entGenStub.reset()

    // End
    t.end()
  })
})

test('### Should return an error ###', function (t) {
  // Sinon sandbox
  const sandbox = sinon.sandbox.create()

  // Fake model's instance
  const fakeInst = {
    getPrimaryKey: sandbox.stub().returns({})
  }

  // Error
  const err = new Error('Fail')

  // Stubs, Spies, Mocks
  const cbSpy = sandbox.spy()
  const deleteEntityStub = sandbox.stub()
  const _tableServiceStub = sandbox.stub(connector, '_tableService').returns({
    deleteEntity: deleteEntityStub.yieldsAsync(err)
  })
  const _tableStub = sandbox.stub(connector, '_table')

  // Function call
  method.call(connector, testModel, fakeInst, cbSpy)

  setImmediate(function () {
    // Asserts
    t.ok(cbSpy.calledOnce)
    t.ok(cbSpy.calledWith(err))
    t.ok(fakeInst.getPrimaryKey.calledOnce)
    t.ok(_tableServiceStub.calledOnce)
    t.ok(entGenStub.calledTwice)
    t.ok(_tableStub.calledOnce)

    // Restore
    sandbox.restore()
    // Reset
    entGenStub.reset()

    // End
    t.end()
  })
})

test('### Stop Arrow ###', function (t) {
  // Restore
  entGenStub.restore()

  arrow.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
