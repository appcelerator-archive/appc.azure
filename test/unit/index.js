'use strict'

const test = require('tap').test
const sinon = require('sinon')

// Method
const createConnector = require('../../lib/').create

test('### Should cretae connector ###', test(function (t) {
  // Sinon sandbox
  var sandbox = sinon.sandbox.create()

  // Test object
  const arrowMock = {
    Connector: {
      Capabilities: {
        ValidatesConfiguration: 'ValidatesConfiguration',
        CanCreate: 'CanCreate',
        CanRetrieve: 'CanRetrieve',
        CanUpdate: 'CanUpdate',
        CanDelete: 'CanDelete'
      },
      extend: sandbox.spy()
    },
    Version: '1.8.0'
  }
  const capColl = Object.keys(arrowMock.Connector.Capabilities).map((k) => arrowMock.Connector.Capabilities[k])

  // Function call
  createConnector(arrowMock)

  // Asserts
  t.ok(arrowMock.Connector.extend.calledOnce)
  t.deep_equal(arrowMock.Connector.extend.args[0][0].capabilities, capColl)

  // Restore
  sandbox.restore()

  // End
  t.end()
}))

test('### Should throw error if Arrow version is not > 1.2.53 ###', test(function (t) {
  const arrowMock = {
    Version: '1.2.0'
  }

  // Asserts
  t.throws(() => { createConnector(arrowMock) }, { message: 'This connector requires at least version 1.2.53 of Arrow; please run `appc use latest`.' }, { skip: false })

  // End
  t.end()
}))
