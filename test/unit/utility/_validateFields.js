'use strict'

const test = require('tap').test
const sinon = require('sinon')

const azureStorage = require('azure-storage')

var orig
var method

test('### Pre ###', function (t) {
  // Keep original value
  orig = azureStorage.TableUtilities.entityGenerator

  // Mock
  azureStorage.TableUtilities.entityGenerator = { String: () => {}, Date: () => {} }

  // Method
  method = require('../../../lib/utility/_validateFields')._validateFields

  t.end()
})

test('### Should return true ###', function (t) {
  // Sinon sandbox
  const sandbox = sinon.sandbox.create()

  // Stubs, Spies
  const cbSpy = sandbox.spy()

  // Function call
  const result = method({}, { name: 'type' }, { name: { type: 'String', default: 'Admin' } }, cbSpy)

  // Asserts
  t.ok(result)
  t.equal(cbSpy.callCount, 0)

  // End
  t.end()
})

test('### Should return false ###', function (t) {
  // Sinon sandbox
  const sandbox = sinon.sandbox.create()

  // Stubs, Spies
  const cbSpy = sandbox.spy()

  // Function call
  const result = method({}, { name: 'test' }, { name: { type: 'Date' } }, cbSpy)

  // Asserts
  t.notOk(result)
  t.ok(cbSpy.calledOnce)

  // End
  t.end()
})

test('### Should return false ###', function (t) {
  // Sinon sandbox
  const sandbox = sinon.sandbox.create()

  // Stubs, Spies
  const cbSpy = sandbox.spy()

  // Function call
  const result = method({}, { name: 'test' }, { name: { type: 'MissingType' } }, cbSpy)

  // Asserts
  t.notOk(result)
  t.ok(cbSpy.calledOnce)

  // End
  t.end()
})

test('### Post ###', function (t) {
  // Restore
  azureStorage.TableUtilities.entityGenerator = orig

  t.end()
})
