'use strict'

const test = require('tap').test
const sinon = require('sinon')

const server = require('../../server')
const method = require('../../../lib/methods/create').create

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

test('### Should create a record ###', function (t) {
  // Sinon sandbox
  const sandbox = sinon.sandbox.create()

  // Fake model's instance
  const fakeInst = {
    toPayload: sandbox.spy()
  }

  // Stubs, Spies, Mocks
  const cbSpy = sandbox.spy()
  const instanceStub = sandbox.stub(testModel, 'instance').returns(fakeInst)
  const insertEntityStub = sandbox.stub()
  const _tableServiceStub = sandbox.stub(connector, '_tableService').returns({
    insertEntity: insertEntityStub.yieldsAsync()
  })
  const _validateFieldsStub = sandbox.stub(connector, '_validateFields').returns(true)
  const _ensurePrimaryKeySetStub = sandbox.stub(connector, '_ensurePrimaryKeySet')
  const _tableStub = sandbox.stub(connector, '_table')
  const findByIDStub = sandbox.stub(connector, 'findByID').yieldsAsync()

  // Function call
  method.call(connector, testModel, {}, cbSpy)

  setImmediate(function () {
    // Asserts
    t.ok(cbSpy.calledOnce)
    t.ok(fakeInst.toPayload.calledOnce)
    t.ok(instanceStub.calledOnce)
    t.ok(_tableServiceStub.calledOnce)
    t.ok(_validateFieldsStub.calledOnce)
    t.ok(_ensurePrimaryKeySetStub.calledOnce)
    t.ok(_tableStub.calledOnce)
    t.ok(findByIDStub.calledOnce)
    t.ok(insertEntityStub.calledOnce)

    // Restore
    sandbox.restore()

    // End
    t.end()
  })
})

test('### Should return an error ###', function (t) {
  // Sinon sandbox
  const sandbox = sinon.sandbox.create()

  // Fake model's instance
  const fakeInst = {
    toPayload: sandbox.spy()
  }

  // Error
  const err = new Error('Fail')

  // Stubs, Spies, Mocks
  const cbSpy = sandbox.spy()
  const instanceStub = sandbox.stub(testModel, 'instance').returns(fakeInst)
  const insertEntityStub = sandbox.stub()
  const _tableServiceStub = sandbox.stub(connector, '_tableService').returns({
    insertEntity: insertEntityStub.yieldsAsync(err)
  })
  const _validateFieldsStub = sandbox.stub(connector, '_validateFields').returns(true)
  const _ensurePrimaryKeySetStub = sandbox.stub(connector, '_ensurePrimaryKeySet')
  const _tableStub = sandbox.stub(connector, '_table')

  // Function call
  method.call(connector, testModel, {}, cbSpy)

  setImmediate(function () {
    // Asserts
    t.ok(cbSpy.calledOnce)
    t.ok(cbSpy.calledWith(err))
    t.ok(fakeInst.toPayload.calledOnce)
    t.ok(instanceStub.calledOnce)
    t.ok(_tableServiceStub.calledOnce)
    t.ok(_validateFieldsStub.calledOnce)
    t.ok(_ensurePrimaryKeySetStub.calledOnce)
    t.ok(_tableStub.calledOnce)
    t.ok(insertEntityStub.calledOnce)

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
