'use strict'

const chain = function (fn, ...args) {
  const current = done => buildCallsStack(current, done)
  return Object.assign(
    current,
    Object.freeze({ prev: this, fn, args, do: suppressContext(chain.bind(current)) })
  )
}

const suppressContext = f => (...args) => f(...args)

const buildCallsStack = (current, done, next = null) => {
  if (current.prev) {
    buildCallsStack(current.prev, done, data => invoke(current, done, next, data))
  } else {
    invoke(current, done, next)
  }
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

module.exports = suppressContext(chain)
