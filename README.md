# act

Inspired by [do](https://github.com/metarhia/do)

This library was born as an attempt to eliminate some of the shortcomings of the [do](https://github.com/metarhia/do) library

What's wrong with `do`:
1) It supports chaining, but does not support reusing blocks of the chain
2) The output of one function(block of chain) does not become the input of another
3) Direct access to only the last result and the last error
4) Based on mutable data structures


#### How to use

```sh
npm i
npm format
npm run test
```

#### Examples

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

act(readFileAsJson, __filename, 'utf-8').call(null, done)
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

act(readFileAsJson, __filename, 'utf-8').call(null, done)
```
