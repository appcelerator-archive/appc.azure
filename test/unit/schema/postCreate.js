'use strict'

const test = require('tap').test
const sinon = require('sinon')

const _ = require('lodash')
const EventEmitter = require('events')
const method = require('../../../lib/schema/postCreate').postCreate

test('### Should not extend model after creation ###', function (t) {
  // Fake scope
  const scope = new EventEmitter()
  scope.name = 'Test'

  // Fake model
  const model = {}

  // Function call
  method.call(scope)

  scope.emit('init-model', model)

  setImmediate(() => {
    t.equal(Object.keys(model).length, 0)
    t.end()
  })
})

test('### Should extend model after creation ###', function (t) {
  // Sinon sandbox
  const sandbox = sinon.sandbox.create()

  // Spies
  const executeSpy = sandbox.spy()

  // Fake connector
  const connector = new EventEmitter()
  connector.name = 'appc.azure'
  connector.getConnector = () => {
    return {
      _execute: executeSpy
    }
  }

  // Fake model
  const model = {
    connector: {
      name: 'appc.azure'
    }
  }

  // Stubs
  const isFunctionStub = sandbox.stub(_, 'isFunction').returns(false)

  // Function call
  method.call(connector)
  connector.emit('init-model', model)
  model.createTable.call(connector, 'User')

  setImmediate(() => {
    t.ok(isFunctionStub.calledOnce)
    t.ok(executeSpy.calledOnce)
    t.equal(Object.keys(model).length, 5)
    t.end()
  })
})
