# domain-http-server

A handy little decorator for adding domain functionality to your HTTP
server's request and response objects.

## Usage

```javascript
var dhs = require('domain-http-server')

http.createServer(function (req, res) {
  dhs(req, res, { close: true, callback: errorHandler })
  // proceed to do stuff.
});

// express style
app.use(dhs)

// close the server on errors
app.use(dhs.defaults({ close: true });

// call a specific callback on errors
app.use(dhs.defaults({ callback: errorHandler })
```

## Options

* `close` Boolean, default=true.  Close the server when there's an
  error, so that it stops accepting requests.  This is handy when
  running as part of a cluster, so that unknown-state processes can be
  cleaned up and replaced.
* `enter` Boolean, default=true.  Enter the domain immediately, so
  that errors thrown in the server's request handler will be caught.
* `exit` Boolean, default=true. Exit the domain when there's an error.
* `callback` Function.  A function that will be called when an error
  occurs.

Also, if the response has an `error` member which is a function, then
it'll call that when there's an error.

If there's no `res.error` method, and there's no `callback` option,
then it'll throw the error.

## Methods

* `dhs(req, res, options, next)`  Attach the domain to the request and
  response.  Options object is optional.  `next` callback is there for
  the benefit of express-style middleware usage.
* `dhs.defaults(options)` Return a dhs function that'll use the
  supplied options.
