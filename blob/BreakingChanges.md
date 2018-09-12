2018.09 10.0.1-preview

* Dropped built-in polyfills for `String`, and following polyfills need to be loaded external for IE11 now:
  * `Promise`
  * `String.prototype.startsWith`
  * `String.prototype.endsWith`
  * `String.prototype.repeat`
  * `String.prototype.includes`