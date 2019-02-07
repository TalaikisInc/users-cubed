import { validate } from 'isemail'

import { tokenHeader, validPhone, dataLib } from '../data'

export default (data, callback) => {
  const token = tokenHeader(data)

  if (token && validate(data.email)) {
    dataLib.read('tokens', token, (err, tokenData) => {
      if (!err && data) {
        if (data.email === tokenData.email && tokenData.expiry > Date.now()) {
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
