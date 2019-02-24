import querystring from 'querystring'
import { App } from 'uWebSockets.js'

import workers from './lib/workers'
import config from './config'
import handlers from './handlers'
import log from './lib/debug/log'
import error from './lib/debug/error'
import json from './lib/server/json'
import statusCodes from './lib/utils/statusCodes'

const port = config.port

const app = {}

app.init = () => {
  App().post('/', (res, req) => {
    let { headers } = req
    json(res, (payload) => {
      payload = typeof payload === 'string' ? querystring.parse(payload) : payload
      const data = {
        headers,
        payload
      }

      const handler = typeof handlers[payload.action] !== 'undefined' ? handlers[payload.action] : handlers['NOT_FOUND']

      handler(data, (statusCode, out) => {
        statusCode = typeof statusCode === 'number' ? statusCode : 400
        out = typeof out === 'object' ? out : {}
        out = JSON.stringify(out)
        res.writeStatus(`${statusCode} ${statusCodes[statusCode]}`)
        res.writeHeader('Content-Type', 'application/json')
        res.end(out)
      })
    }, () => {
      log('Invalid JSON or no data at all!')
    })
  }).listen(port, (token) => {
    if (token) {
      log(`Listening to port ${port}`)
    } else {
      error(`Failed to listen to port ${port}`)
    }
  })

  workers.init()
}

app.init()

export default app
