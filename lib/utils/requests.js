import http from 'http'
import https from 'https'
import { stringify } from 'querystring'

import error from '../debug/error'

export default (schema, obj, callback) => {
  const schemaLib = typeof schema === 'string' && schema === 'http' ? http : https
  const payloadString = stringify(obj.data)
  obj.headers['Content-Length'] = Buffer.byteLength(payloadString)

  const req = schemaLib.request(obj, (res) => {
    const status = res.statusCode
    if (status === 200 || status === 201) {
      callback({ error: false })
    } else {
      callback({ error: status })
    }
  })

  req.on('error', (err) => {
    // @TODO log here
    error(err.message)
    callback({ error: err.message })
  })

  req.on('timeout', () => {
    // @TODO log here
    callback({ error: 'Request timed out.' })
  })

  req.write(payloadString)
  req.end()
}
