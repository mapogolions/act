# act

Inspired by [do](https://github.com/metarhia/do)


#### How to install

```sh
npm i @mapogolions/act
```

#### Usage

##### How to use with `CPS`

```js
const fs = require('fs')
const path = require('path')

function readFileAsJson(filename, encoding, next) {
  fs.readFile(filename, encoding, (err, content) => {
    if (err) {
      next(err)
      return;
    }
    try {
      const obj = JSON.parse(content)
      next(null, obj)
    } catch (err) {
      next(err)
    }
  });
}

function selectKeys(props, obj, next) {
    const view = {};
    for (const prop of props) {
       view[prop] = obj[prop]
    }
    next(null, view);
}

var filename = path.join(__dirname, 'package.json');
const f = act(readFileAsJson, filename, 'utf-8')
    .act(selectKeys, ['version', 'license']);

f((err, result) => {
  if (err) {
    console.error(err.message)
    return;
  }
  console.log(result);
})
```

##### How to use with `Promise`

```js
const fs = require('fs').promises
const path = require('path')

function readFileAsJson(filename, encoding, next) {
  fs.readFile(filename, encoding)
    .then(content => next(null, JSON.parse(content)))
    .catch(next)
}

function selectKeys(props, obj, next) {
    const view = {};
    for (const prop of props) {
       view[prop] = obj[prop]
    }
    next(null, view);
}

var filename = path.join(__dirname, 'package.json');
const f = act(readFileAsJson, filename, 'utf-8')
    .act(selectKeys, ['version', 'name']);

f((err, result) => {
  if (err) {
    console.error(err.message)
    return;
  }
  console.log(result);
})
```

##### Reusable blocks

```js
const fs = require('fs')
const path = require('path')

function parseContent(content, next) {
  setTimeout(() => {
    console.log('called once')
    try {
      next(null, JSON.parse(content))
    } catch (err) {
      next(err)
    }
  })
}

function getSetting(key, settings, next) {
  // the second argument (settings) will be provided by the `parseContent`
  setTimeout(next, 0, null, settings[key])
}

function done(err, result) {
  if (err) {
    console.error(err.message)
    return;
  }
  console.log(result);
}

// define block
const readSettings = act(fs.readFile, path.join(__dirname, 'package.json'), 'utf-8')
  .act(parseContent)
  .once()

// Note that if we DO NOT call `once` then fs.readFile and parseContent will be called for each branch
// `Once` caches the result and reuses it across branches
// Whether or not to use this kind of optimization depends on your task.
// In this example, `once` helps to avoid double reading and parsing

readSettings.act(getSetting, 'license')(done)
readSettings.act(getSetting, 'version').call(null, done)
```

Also see [unit tests](./test/test.js) for more details
