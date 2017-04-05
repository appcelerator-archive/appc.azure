'use strict'

const test = require('tap').test

const method = require('../../../lib/utility/_parsePrimaryKey')._parsePrimaryKey

test('### Should parse the primary key ###', function (t) {
  const parsed = method('xx.yy')

  // Asserts
  t.ok(parsed)
  t.ok(parsed.PartitionKey)
  t.ok(parsed.RowKey)
  t.equal(parsed.PartitionKey, 'xx')
  t.equal(parsed.RowKey, 'yy')

  // End
  t.end()
})

test('### Should return the primary key ###', function (t) {
  const parsed = method(5)

  // Asserts
  t.ok(parsed)
  t.equal(parsed, 5)

  // End
  t.end()
})
