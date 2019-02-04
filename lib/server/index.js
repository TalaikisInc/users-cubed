import http from 'http'
import querystring from 'querystring'
import { StringDecoder } from 'string_decoder'

import config from '../../config'
import handlers from '../../router'
import { stringToJson, log, error } from '../../lib'

const server = http.createServer((req, res) => {
  let { method, headers } = req
  if (method === 'POST') {
    const decoder = new StringDecoder('utf-8')
    const action = req.body.action
    let buffer = ''

    req.on('data', (data) => {
      buffer += decoder.write(data);
    })

    req.on('error', (err) => {
      error(err)
    })

    req.on('end', () => {
      buffer += decoder.end()
      const handler = typeof handlers[action] !== 'undefined' ? handlers[action] : handlers['NOT_FOUND']

      stringToJson(buffer, (inPayload) => {
        inPayload = typeof inPayload === 'string' ? querystring.parse(inPayload) : inPayload
        const data = {
          headers,
          payload: inPayload
        }

        handler(data, (statusCode, outPayload) => {
          statusCode = typeof statusCode === 'number' ? statusCode : 400
          res.setHeader('Content-Type', 'application/json')
          outPayload = typeof outPayload === 'object' ? outPayload : {}
          outPayload = JSON.stringify(outPayload)
          res.writeHead(statusCode)
          res.end(outPayload)
        })
      })
    })
  } else {
    res.writeHead(405)
    res.end(JSON.stringify({}))
  }
})

server.on('error', (err) => {
  error(err)
})

const port = config['port']

server.init = () => {
  server.listen(port, () => {
    log(`Server listens to ${port}`, 'FgGreen')
  })
}

export default server
