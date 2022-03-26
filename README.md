# act

Inspired by [do](https://github.com/metarhia/do)

This library was born as an attempt to eliminate some of the shortcomings of the [do](https://github.com/metarhia/do) library

What's wrong with `do`:
1) It supports chaining, but does not support reusing blocks of the chain
2) The output of one function(block of chain) does not become the input of another
3) Direct access to only the last result and the last error
4) Based on mutable data structures


#### How to install

```sh
npm i @mapogolions/do
```

#### Usage

##### How to use with `CPS`

```js
function readFileAsJson(filename, encoding, next) {
  fs.readFile(filename, encoding, (err, content) => {
    if (err) {
      next(null, data)
      return;
    }
    try {
      const contentAsJson = JSON.parse(content)
      next(null, contentAsJson)
    } catch (err) {
      next(err)
    }
  });
}

function done(err, result) {
  if (err) {
    console.error(err.message)
    return;
  }
  console.log(result);
}

act(readFileAsJson, ${filename}, 'utf-8').call(null, done)
```

##### How to use with `Promise`

```js
function readFileAsJson(filename, encoding, next) {
  fs.readFile(filename, encoding)
    .then(content => next(null, JSON.parse(content)))
    .catch(next)
}

function done(err, result) {
  if (err) {
    console.error(err.message)
    return;
  }
  console.log(result);
}

act(readFileAsJson, ${filename}, 'utf-8').call(null, done)
```

##### Partially applied function
```js
function readFileAsJson(filename, encoding, next) {
  fs.readFile(filename, encoding)
    .then(content => next(null, JSON.parse(content)))
    .catch(next)
}

function readSetting(key, settings, next) {
  new Promise(resolve => {
    setTimeout(resolve, 0, settings[key]);
  })
    .then(setting => next(null, setting))
    .catch(next)
}

function done(err, result) {
  if (err) {
    console.error(err.message)
    return;
  }
  console.log(result);
}

act(readFileAsJson, ${filename}, 'utf-8')
  .act(readSetting, 'license') // the second argument (settings) will be provided by the `readFileAsJson`
  .call(null, done)
```

##### Reusable blocks (because this library is fully immutable)
```js
function readFile(filename, encoding, next) {
  fs.readFile(filename, encoding)
    .then(content => next(null, content))
    .catch(next)
}

function convertToJson(content, next) {
  new Promise((resolve, reject) => {
    setTimeout(() => resolve(JSON.parse(content)));
  })
    .then(settings => next(null, settings));
    .catch(next)
}

function getSetting(key, settings, next) {
  new Promise(resolve => {
    setTimeout(resolve, 0, settings[key])
  })
    .then(setting => next(null, setting))
    .catch(next)
}

function done(err, result) {
  if (err) {
    console.error(err.message)
    return;
  }
  console.log(result);
}

const readSettings = act(readFile, ${filename}, 'utf-8').act(convertToJson) // define a reusable block
readSettings.act(getSetting, 'license').call(null, done)
readSettings.act(getSetting, 'author').call(null, done)
```

Also see [unit tests](./test/test.js) for more details
