'use strict'

const test = require('ava')
const { once } = require('../src/act.js')

test.cb('delayed call should get value from cache when its registration precedes cps call', t => {
  let calls = 0
  let consumers = 0
  const readKey = next => setTimeout(() => {
    calls++
    next(null, 'key')
  }, 500)

  const readKeyOnce = once(readKey)

  setTimeout(() => {
    readKeyOnce((err, key) => {
      consumers++
      t.is(err, null)
      t.is(key, 'key')
      t.is(calls, 1)
    })
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

test.cb('delayed call should get value from cache when its registration follows cps call', t => {
  let calls = 0
  let consumers = 0
  const readKey = next => setTimeout(() => {
    calls++
    next(null, 'key')
  }, 50)
  const readKeyOnce = once(readKey)

  setTimeout(() => {
    readKeyOnce((err, key) => {
      consumers++
      t.is(err, null)
      t.is(key, 'key')
      t.is(calls, 1)
    })
  })

  setTimeout(() => { // delayed call
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

test.cb('should get value from cache when non-blocking sequential calls', t => {
  let calls = 0
  let consumers = 0
  const readKey = next => setTimeout(() => {
    calls++
    next(null, 'key')
  }, 100)

  const readKeyOnce = once(readKey)

  readKeyOnce((err, key) => {
    consumers++
    t.is(err, null)
    t.is(key, 'key')
    t.is(calls, 1)
  })

  readKeyOnce((err, key) => {
    consumers++
    t.is(err, null)
    t.is(key, 'key')
    t.is(calls, 1)
    t.is(consumers, 2)

    t.end()
  })
})

test.cb('should be able to pass extra arguments and callback as last one', t => {
  const f = once((n, callback) => setTimeout(callback, 0, null, ++n))

  f(3, (_err, result) => {
    t.is(result, 4)
    t.end()
  })
})

test.cb('blocking function should block flow', t => {
  let shared = 0
  const f = once(callback => { shared++; callback(null) })
  f((_err, _result) => {
    t.is(shared, 1)
  })

  t.is(shared, 1)
  t.end()
})

test.cb('non-blocking function should not block flow', t => {
  let shared = 0
  const f = once(next => setTimeout(() => {
    shared++
    next(null)
  }))

  f((_err, _result) => {
    t.is(shared, 1)
    t.end()
  })

  t.is(shared, 0)
})
