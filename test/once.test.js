'use strict'

const test = require('ava')
const { once } = require('../src/act.js')

test.cb('cps should be called only once when called from multiple consumers', t => {
  let calls = 0
  let consumers = 0
  const readKey = next => setTimeout(() => {
    calls++
    next(null, 'key')
  }, 500) // execute after all registration
  const readKeyOnce = once(readKey)
  readKeyOnce((err, key) => {
    consumers++
    t.is(err, null)
    t.is(key, 'key')
    t.is(calls, 1)
  })

  setTimeout(() => {
    readKeyOnce((err, key) => {
      consumers++
      t.is(err, null)
      t.is(key, 'key')
      t.is(calls, 1)
      t.is(consumers, 2)

      t.end()
    })
  }, 100)
})

test.cb('should get value from cache when cps has been already called', t => {
  let calls = 0
  let consumers = 0
  const readKey = next => setTimeout(() => {
    calls++
    next(null, 'key')
  }, 10)
  const readKeyOnce = once(readKey)
  readKeyOnce((err, key) => {
    consumers++
    t.is(err, null)
    t.is(key, 'key')
    t.is(calls, 1)
  })

  setTimeout(() => {
    readKeyOnce((err, key) => {
      consumers++
      t.is(err, null)
      t.is(key, 'key')
      t.is(calls, 1)
      t.is(consumers, 2)

      t.end()
    })
  }, 500)
})
