# act

Inspired by [do](https://github.com/metarhia/do)


#### How to install

```sh
npm i @mapogolions/act
```

#### Usage

##### Some examples to get the basic idea

```js
function buildGreeting(phrase, who, next) {
    const greeting = `${phrase} ${who}`;
    return next(null, greeting);
}

function printGreeting(applyStyle, phrase, next) {
    console.log(applyStyle(phrase));
    next(null, true);
}

function done(err, result) {
    if (err != null) {
        console.log(err)
        return
    }
    console.log(result);
}

act(buildGreeting, "Hello", "Jane Doe")
  .act(printGreeting, x => x.toUpperCase())
  .call(null, done);
```

User can interrupt execution at any point by using the `next` callback and passing a `non-null` object as the first argument

```js
function basicAuth(headers, { userName, password }, next) {
    const header = headers['Authorization'];
    const decoded = Buffer.from(header, 'base64').toString('utf-8');
    var parts = decoded.split(':');
    if (userName === parts[0] && password === parts[1]) {
        next(null, true);
        return;
    }
    next(new Error('Invalid credentials'));
}

function done(err, result) {
    if (err !== null) {
        console.log(err.message);
        return;
    }
    console.log(result);
}

const headers = {
  Authorization: Buffer.from('admin:pwd').toString('base64')
};

act(basicAuth, headers, { userName: 'admin', password: '123' }).call(null, done);
```

##### How to use with `CPS`

```js
function readFileAsJson(filename, encoding, next) {
  fs.readFile(filename, encoding, (err, content) => {
    if (err) {
      next(null, data)
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

##### Partially applied function & Reusable blocks

```js
function parseContent(content, next) {
  setTimeout(() => {
    try {
      next(null, JSON.parse(content))
    } catch (err) {
      next(err)
    }
  })
}

function getSetting(key, settings, next) { // the second argument (settings) will be provided by the `parseContent`
  setTimeout(next, 0, null, settings[key])
}

function done(err, result) {
  if (err) {
    console.error(err.message)
    return;
  }
  console.log(result);
}

const readSettings = act(fs.readFile, ${filename}, 'utf-8').act(parseContent) // define a reusable block
readSettings.act(getSetting, 'license').call(null, done)
readSettings.act(getSetting, 'author').call(null, done)
```

Also see [unit tests](./test/test.js) for more details
