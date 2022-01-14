'use strict'

const act = function (fn, ...args) {
  const current = done => invoke(...buildCallsStack(current, done))
  return Object.assign(
    current,
    Object.freeze({ prev: this, fn, args, act: act.bind(current) })
  )
}

const buildCallsStack = (current, done, next = null) => {
  if (!current.prev) {
    return [current, done, next]
  }
  return buildCallsStack(current.prev, done, data => invoke(current, done, next, data))
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

module.exports = act.bind(null)
