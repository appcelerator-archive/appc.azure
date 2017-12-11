'use strict'

const test = require('tap').test
const sinon = require('sinon')
var azureStorage = require('azure-storage')
// var Arrow = require('arrow')
var _ = require('lodash')

const server = require('../../server')
const method = require('../../../lib/methods/query').query

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

// test('### Should return all records ###', function (t) {
//   // Sinon sandbox
//   const sandbox = sinon.sandbox.create()

//   // Stubs, Spies, Mocks
//   const whereSpy = sandbox.spy()
//   const isFunctionStub = sandbox.stub(_, 'isFunction').returns(false)
//   const payloadKeysStub = sandbox.stub(testModel, 'payloadKeys').returns([])
//   const translateKeysForPayloadStub = sandbox.stub(testModel, 'translateKeysForPayload').returns({})
//   const topStub = sandbox.stub().callsFake(() => {
//     return {
//       where: whereSpy
//     }
//   })
//   const selectStub = sandbox.stub().returns({
//     top: topStub
//   })
//   const tableQueryStub = sandbox.stub(azureStorage, 'TableQuery').returns({
//     select: selectStub
//   })
//   const cbSpy = sandbox.spy()
//   const queryEntitiesStub = sandbox.stub()
//   const _tableServiceStub = sandbox.stub(connector, '_tableService').returns({
//     queryEntities: queryEntitiesStub.yieldsAsync(null, { entries: [{}] })
//   })
//   const _tableStub = sandbox.stub(connector, '_table')
//   const _transformEntityToModelStub = sandbox.stub(connector, '_transformEntityToModel')
//   const collectionStub = sandbox.stub(Arrow, 'Collection')

//   // Function call
//   method.call(connector, testModel, { page: 1, skip: 0, where: {} }, cbSpy)

//   setImmediate(function () {
//     // Asserts
//     t.ok(cbSpy.calledOnce)
//     t.ok(whereSpy.calledOnce)
//     t.ok(_tableServiceStub.calledOnce)
//     t.ok(_tableStub.calledOnce)
//     t.ok(topStub.calledOnce)
//     t.ok(tableQueryStub.calledOnce)
//     t.ok(collectionStub.calledOnce)
//     t.ok(isFunctionStub.calledOnce)
//     t.ok(payloadKeysStub.calledOnce)
//     t.ok(selectStub.calledOnce)
//     t.ok(translateKeysForPayloadStub.calledOnce)
//     t.ok(_transformEntityToModelStub.calledOnce)

//     // Restore
//     sandbox.restore()

//     // End
//     t.end()
//   })
// })

test('### Should return an error ###', function (t) {
  // Sinon sandbox
  const sandbox = sinon.sandbox.create()

  // Error
  const err = new Error('Fail')

  // Stubs, Spies, Mocks
  const whereSpy = sandbox.spy()
  const isFunctionStub = sandbox.stub(_, 'isFunction').returns(false)
  const payloadKeysStub = sandbox.stub(testModel, 'payloadKeys').returns([])
  const translateKeysForPayloadStub = sandbox.stub(testModel, 'translateKeysForPayload').returns({})

  // const reqStub = sinon.stub().callsFake(() => { return makeRequestStub })
  const topStub = sinon.stub().callsFake(() => {
    return {
      where: whereSpy
    }
  })
  const selectStub = sandbox.stub().returns({
    top: topStub
  })
  const tableQueryStub = sandbox.stub(azureStorage, 'TableQuery').returns({
    select: selectStub
  })
  const cbSpy = sandbox.spy()
  const queryEntitiesStub = sandbox.stub()
  const _tableServiceStub = sandbox.stub(connector, '_tableService').returns({
    queryEntities: queryEntitiesStub.yieldsAsync(err)
  })
  const _tableStub = sandbox.stub(connector, '_table')

  // Function call
  method.call(connector, testModel, { page: 1, skip: 0, where: {} }, cbSpy)

  setImmediate(function () {
    // Asserts
    t.ok(cbSpy.calledOnce)
    t.ok(cbSpy.calledWith(err))
    t.ok(whereSpy.calledOnce)
    t.ok(_tableServiceStub.calledOnce)
    t.ok(_tableStub.calledOnce)
    t.ok(topStub.calledOnce)
    t.ok(tableQueryStub.calledOnce)
    t.ok(isFunctionStub.calledOnce)
    t.ok(payloadKeysStub.calledOnce)
    t.ok(selectStub.calledOnce)
    t.ok(translateKeysForPayloadStub.calledOnce)

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
