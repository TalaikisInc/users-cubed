import { tokenHeader, validPhone, dataLib } from '../data'

const auth = (data, callback) => {
  const token = tokenHeader(data)
  const phone = validPhone(data)

  if (token && phone) {
    dataLib.read('tokens', token, (err, data) => {
      if (!err && data) {
        if (data.phone === phone && data.expiry > Date.now()) {
          callback(data)
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

export {
  auth
}
