import { validate } from 'isemail'

import tokenHeader from '../data/tokenHeader'
import dataLib from '../data/functions'

export default (data, callback) => {
  const token = tokenHeader(data)

  if (token && validate(data.payload.email)) {
    dataLib.read('tokens', token, (err, tokenData) => {
      if (!err && tokenData) {
        if (data.payload.email === tokenData.email && tokenData.expiry > Date.now()) {
          callback(tokenData)
        } else {
          callback(false)
        }
      } else {
        callback(false)
      }
    })
  } else {
    callback(false)
  }
}
