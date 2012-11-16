var http = require('http');
var test = require('tap').test;
var server;
var dhs = require('../');
var fs = require('fs');
var request = require('request');

function req (u, t) {
  request('http://localhost:1337/' + u, function(er, res, body) {
    console.error('back', er, res.statusCode, res.headers, body);
    if (er)
      throw er;

    if (u === 'ok')
      return ok(res, body, t);

    t.equal(res.statusCode, 500, 'status code should be 500');
    t.notOk(process.domain, 'domain should have exited');

    // the error should reference this file first.
    t.like(body, new RegExp('^' +
      'Error: /' + u + '\n' +
      '    at .*' + __filename + ':[0-9]+:[0-9]+\\)\n'));
    t.end();
  });
}

function ok(res, body, t) {
  t.equal(res.statusCode, 200, 'status code should be 200');
  t.notOk(process.domain, 'domain should have exited');

  // the error should reference this file first.
  t.equal(body, 'ok');
  t.end();
}

test('setup', function(t) {
  console.error('setup');
  server = http.createServer(function (req, res) {
    dhs(req, res);
    res.error = function(er) {
      res.statusCode = 500;
      res.end(er.stack || er.message);
    };

    function t() {
      throw new Error(req.url);
    }

    switch (req.url) {
      case '/st':
        return setTimeout(t, 100);
      case '/nt':
        return process.nextTick(t);
      case '/f':
        return fs.readFile(__filename, t);
      case '/ok':
        return res.end('ok');
      default:
        t();
    }
  });
  server.listen(1337, function() {
    t.pass('listening');
    t.end();
  });
});

test('basic', function(t) {
  req('', t);
});

test('setTimeout', function(t) {
  req('st', t);
});

test('nextTick', function(t) {
  req('nt', t);
});

test('readFile', function(t) {
  req('f', t);
});

test('non-error', function(t) {
  req('ok', t);
});

test('shutdown', function(t) {
  server.close(function() {
    t.pass('ok');
    t.end();
  });
});
