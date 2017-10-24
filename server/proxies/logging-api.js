module.exports = function(app, options) {
  var HttpProxy = require('http-proxy');
  var path = require('path');
  var config = require('../../config/environment')().APP;

  var proxy = HttpProxy.createProxyServer({
    ws: false,
    xfwd: false,
    target: config.loggingApiServer,
    secure: false,
  });
  proxy.on('error', onProxyError);

  // logging API
  app.use(config.loggingEndpoint, function(req, res, next) {
    req.url = path.join(config.loggingEndpoint, req.url);
    req.headers['X-Forwarded-Proto'] = req.protocol;

    proxyLog('Logging', req);
    proxy.web(req, res);
  });
}

function onProxyError(err, req, res) {
  console.log('Proxy Error on '+ req.method + ' to', req.url, err);
  var error = {
    type: 'error',
    status: 500,
    code: 'ProxyError',
    message: 'Error connecting to proxy',
    detail: err.toString()
  }

  if ( req.upgrade )
  {
    res.end();
  }
  else
  {
    res.writeHead(500, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(error));
  }
}

function proxyLog(label, req) {
  console.log('['+ label+ ']', req.method, req.url);
}
