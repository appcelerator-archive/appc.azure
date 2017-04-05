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
      method = require('../../../lib/methods/save').save

      t.ok(arrow, 'Arrow has been started')
      t.end()
    })
    .catch(t.threw)
})

test('### Should save a record ###', function (t) {
  // Sinon sandbox
  const sandbox = sinon.sandbox.create()

  // Fake model's instance
  const fakeInst = {
    toPayload: sandbox.spy(),
    getPrimaryKey: sandbox.stub().returns({})
  }

  // Stubs, Spies, Mocks
  const cbSpy = sandbox.spy()
  const updateEntityStub = sandbox.stub()
  const _tableServiceStub = sandbox.stub(connector, '_tableService').returns({
    updateEntity: updateEntityStub.yieldsAsync()
  })
  const _validateFieldsStub = sandbox.stub(connector, '_validateFields').returns(true)
  const _tableStub = sandbox.stub(connector, '_table')
  const findByIDStub = sandbox.stub(connector, 'findByID').yieldsAsync()

  // Function call
  method.call(connector, testModel, fakeInst, cbSpy)

  setImmediate(function () {
    // Asserts
    t.ok(cbSpy.calledOnce)
    t.ok(fakeInst.toPayload.calledOnce)
    t.ok(fakeInst.getPrimaryKey.calledOnce)
    t.ok(_tableServiceStub.calledOnce)
    t.ok(_validateFieldsStub.calledOnce)
    t.ok(_tableStub.calledOnce)
    t.ok(findByIDStub.calledOnce)
    t.ok(updateEntityStub.calledOnce)

    // Reset
    entGenStub.reset()

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

  // Fake model's instance
  const fakeInst = {
    toPayload: sandbox.spy(),
    getPrimaryKey: sandbox.stub().returns({})
  }

  // Stubs, Spies, Mocks
  const cbSpy = sandbox.spy()
  const updateEntityStub = sandbox.stub()
  const _tableServiceStub = sandbox.stub(connector, '_tableService').returns({
    updateEntity: updateEntityStub.yieldsAsync(err)
  })
  const _validateFieldsStub = sandbox.stub(connector, '_validateFields').returns(true)
  const _tableStub = sandbox.stub(connector, '_table')

  // Function call
  method.call(connector, testModel, fakeInst, cbSpy)

  setImmediate(function () {
    // Asserts
    t.ok(cbSpy.calledOnce)
    t.ok(cbSpy.calledWith(err))
    t.ok(fakeInst.toPayload.calledOnce)
    t.ok(fakeInst.getPrimaryKey.calledOnce)
    t.ok(_tableServiceStub.calledOnce)
    t.ok(_validateFieldsStub.calledOnce)
    t.ok(_tableStub.calledOnce)
    t.ok(updateEntityStub.calledOnce)

    // Reset
    entGenStub.reset()

    // Restore
    sandbox.restore()

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
