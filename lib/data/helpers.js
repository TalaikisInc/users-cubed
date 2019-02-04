import { dataLib } from './functions'
import { tokenHeader, validPhone } from './vars'

const finalizeRequest = (collection, id, action, callback, obj) => {
  if (typeof obj === 'object') {
    dataLib[action](collection, id, obj, (err) => {
      if (!err) {
        callback(200)
      } else {
        callback(500, { error: `Could not ${action} from ${collection}.` })
      }
    })
  } else {
    dataLib[action](collection, id, (err) => {
      if (!err) {
        callback(200)
      } else {
        callback(500, { error: `Could not ${action} from ${collection}.` })
      }
    })
  }
}

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

const joinDelete = (table, col, callback) => {
  const toDelete = col.length
  if (toDelete > 0) {
    let deleted = 0
    let errors = false
    col.forEach((id) => {
      dataLib.delete(table, id, (err) => {
        if (!err) {
          deleted += 1
        } else {
          errors = true
        }

        if (deleted === toDelete) {
          if (!errors) {
            callback(false)
          } else {
            callback(`Error occured when deleting some ${col} fomr ${table}.`)
          }
        }
      })
    })
  } else {
    callback(false)
  }
}

export {
  finalizeRequest,
  auth,
  joinDelete
}
