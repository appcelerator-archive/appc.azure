'use strict'

const fetchmetadata = require('../../../lib/metadata/fetchMetadata').fetchMetadata
const sinon = require('sinon')
const test = require('tap').test

test('### Should fetch metadata ### ', function (t) {
  // Sinon sandbox
  const sandbox = sinon.sandbox.create()

  // Spies
  var next = sandbox.spy()

  // Result data
  const data = {
    fields: [{
      default: '',
      description: 'Azure Account',
      name: 'azure_account',
      required: true,
      type: 'text',
      validator: null
    }, {
      default: '',
      description: 'Azure API Key',
      name: 'azure_key',
      required: true,
      type: 'text',
      validator: null
    }]
  }

  // Function call
  fetchmetadata(next)

  // Asserts
  t.ok(next.calledOnce)
  t.equals(next.firstCall.args[0], null)
  t.deepequal(next.firstCall.args[1], data)

  // Restore
  sandbox.restore()

  // End
  t.end()
})
