'use strict'

const test = require('ava')
const chain = require('../src/index')

test.cb('should execute chain', t => {
  const readConfig = wrap(40, (filename, key, next) => {
    t.is(filename, '.env')
    t.is(key, 'connectionString')
    next(null, './db.sqlite3')
  })

  const select = wrap(30, (query, connectionString, next) => {
    t.is(query, 'select email from')
    t.is(connectionString, './db.sqlite3')
    next(null, ['foo', 'bar'])
  })

  const intercept = wrap(20, (data, next) => {
    t.deepEqual(data, ['foo', 'bar'])
    data.push('baz')
    next(null, data)
  })

  const sendEmail = wrap(70, (subject, msg, emails, next) => {
    t.is(subject, '[subject]')
    t.is(msg, '...')
    t.deepEqual(emails, ['foo', 'bar', 'baz'])
    next(null, true)
  })

  const f = chain(readConfig, '.env', 'connectionString')
    .do(select, 'select email from')
    .do(intercept)
    .do(sendEmail, '[subject]', '...')

  f((err, result) => {
    t.is(err, null)
    t.truthy(result)
    t.end()
  })
})

test.cb('should reuse shared block of chain', t => {
  const counter = wrap(10, (n, next) => next(null, ++n))
  const f = chain(counter, 0).do(counter).do(counter)
  const g = f.do(counter)
  const h = f.do(counter).do(counter).do(counter).do(counter).do(counter).do(counter)

  f((_err, result) => t.is(result, 3))
  g((_err, result) => t.is(result, 4))
  h((_err, result) => {
    t.is(result, 9)
    t.end()
  })
})

test.cb('should skip tail of chain', t => {
  const foo = wrap(40, (next) => {
    next(null, 'foo')
  })

  const bar = wrap(20, (data, next) => {
    t.is(data, 'foo')
    next({ code: 101 })
  })

  const baz = wrap(30, next => t.fail)

  const f = chain(foo).do(bar).do(baz)
  f((err, result) => {
    t.is(err.code, 101)
    t.is(result, undefined)
    t.end()
  })
})

test.cb('should suppress context', t => {
  const f = wrap(100, _next => {
    t.pass()
    t.end()
  })
  chain.call({ }, f)()
})

test.cb('should execute one element chain', t => {
  const f = wrap(100, (foo, bar, _next) => {
    t.is(foo, 'foo')
    t.is(bar, 'bar')
    t.end()
  })
  chain(f, 'foo', 'bar')()
})

const wrap = (delay, fn) => (...args) => setTimeout(fn, delay, ...args)
