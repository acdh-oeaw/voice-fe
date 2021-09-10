/**
 * "name": "restana-static"
 * "version": "1.3.2"
 * "description": "Efficiently serve static files using Node.js and Docker containers."
 * "author": "Rolando Santamaría Masó <kyberneees@gmail.com>"
 * "license": "MIT"
 * "bugs": "https://github.com/jkyberneees/restana-static/issues"
 * "homepage": "https://github.com/jkyberneees/restana-static#readme"
 */

process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';
const config = require('config')
const files = require('serve-static')
const path = require('path')
const os = require('os');
const cache = require('http-cache-middleware')
const morgan = require('morgan')

  // configuration
  const {
    DIST_DIRECTORY,
    PORT,
    CACHE_ENABLED,
    CACHE_CONTROL_HEADER_VALUE,
    DEFALUT_FILE,
    LOGS_FORMAT,
    LOGS_ENABLED
  } = process.env

  const c = {
    distDirectory: DIST_DIRECTORY || (config.has('distDirectory') ? config.get('distDirectory') :
    'dist/'),
    port: PORT || (config.has('port') ? config.get('port') :
    3000),
    cacheEnabled: isEnabled(CACHE_ENABLED, 'cacheEnabled', config),
    cacheControlHeaderValue: CACHE_CONTROL_HEADER_VALUE || (config.has('cacheControlHeaderValue') ? config.get('cacheControlHeaderValue') :
    'public, no-cache, max-age=604800'),
    defaultFile: DEFALUT_FILE || (config.has('defaultFile') ? config.get('defaultFile') :
    'index.html'),
    logsEnabled: isEnabled(LOGS_ENABLED, 'logsEnabled', config),
    logsFormat: LOGS_FORMAT || (config.has('logsFormat') ? config.get('logsFormat') :
    jsonFormat)
  }

  // middleware for serving static files
  const serve = files(path.join(__dirname, c.distDirectory), {
    lastModified: false,
    setHeaders: (res) => {
      if (c.cacheEnabled) {
        res.setHeader('cache-control', c.cacheControlHeaderValue)
      }
    }
  })

  // server bootstrap
  const server = require('restana')({})
  if (c.logsEnabled) {
    server.use(morgan(c.logsFormat))
  }
  server.use((req, res, next) => {
    if (req.url === '/') {
      req.url = c.defaultFile
    }

    return next()
  })

  // supporting custom middlewares
//   for (const middleware of middlewares) {
//     server.use(middleware())
//   }

  // supporting cache
  if (c.cacheEnabled) {
    server.use(cache())
  }
  server.use(serve)

function isEnabled (env, configKey, config) {
  if (env !== undefined) {
    if (env === 'true') return true
    else return false
  } else {
    return config.has(configKey) ? config.get(configKey) : true
  }
}

morgan.token('conversation-id', function getConversationId(req) {
    return req.conversationId;
});
morgan.token('session-id', function getSessionId(req) {
    return req.sessionId;
});
morgan.token('instance-id', function getInstanceId(req) {
    return req.instanceId;
});
morgan.token('hostname', function getHostname() {
    return os.hostname();
});
morgan.token('pid', function getPid() {
    return process.pid;
});

function jsonFormat(tokens, req, res) {
    return JSON.stringify({
        'remote-address': tokens['remote-addr'](req, res),
        'time': tokens['date'](req, res, 'iso'),
        'method': tokens['method'](req, res),
        'url': tokens['url'](req, res),
        'http-version': tokens['http-version'](req, res),
        'status-code': tokens['status'](req, res),
        'content-length': tokens['res'](req, res, 'content-length'),
        'referrer': tokens['referrer'](req, res),
        'user-agent': tokens['user-agent'](req, res),
        'conversation-id': tokens['conversation-id'](req, res),
        'session-id': tokens['session-id'](req, res),
        'hostname': tokens['hostname'](req, res),
        'instance': tokens['instance-id'](req, res),
        'pid': tokens['pid'](req, res)
    });
}

console.log(JSON.stringify(c))
server.start(c.port)