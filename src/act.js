'use strict'

const act = function (fn, ...args) {
  const current = done => invoke(...buildCallStack(current, done))
  return Object.assign(
    current,
    Object.freeze({
      prev: this,
      fn,
      args,
      act: act.bind(current),
      once: () => act(once(current))
    })
  )
}

const None = Symbol('None')

const once = fn => {
  let queue = []
  let result = None
  let running = false
  return (...args) => {
    const callback = args.pop()
    if (result !== None) {
      callback(...result)
      return
    }
    queue.push(callback)
    if (running) return
    running = true
    fn(...args, (...args) => {
      result = args
      queue.forEach(f => f(...result))
      queue = []
    })
  }
}

const buildCallStack = (current, done, next = null) => {
  if (!current.prev) return [current, done, next]
  return buildCallStack(current.prev, done, data => invoke(current, done, next, data))
}

const invoke = (current, done, next, rest = []) => {
  if (!current.fn) return
  const args = [...current.args, ...rest]
  current.fn(...args, (err, ...data) => {
    if (err) {
      done(err)
      return
    }
    if (next) {
      next(data)
      return
    }
    if (done) {
      done(null, ...data)
    }
  })
}

module.exports = { act: act.bind(null), once }
