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
