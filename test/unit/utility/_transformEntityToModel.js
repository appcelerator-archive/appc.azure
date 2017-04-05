'use strict'

const test = require('tap').test
const sinon = require('sinon')
const _ = require('lodash')

const method = require('../../../lib/utility/_transformEntityToModel')._transformEntityToModel

test('### Should transform entity to model ###', function (t) {
  // Sinon sandbox
  const sandbox = sinon.sandbox.create()

   // Fake model's instance
  const fakeInst = {
    setPrimaryKey: sandbox.spy()
  }

  // Test data
  const model = {
    instance: sandbox.stub().returns(fakeInst)
  }

  // Stubs
  const omitStub = sandbox.stub(_, 'omit').returns({
    primarykey: 'id'
  })

  // Function call
  const instance = method(model, {})

  // Asserts
  t.ok(omitStub.calledOnce)
  t.ok(model.instance.calledOnce)
  t.ok(fakeInst.setPrimaryKey.calledOnce)
  t.ok(instance)
  t.equal(instance, fakeInst)

  // End
  t.end()
})
