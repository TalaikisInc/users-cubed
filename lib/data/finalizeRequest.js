import dataLib from './functions'

export default (collection, id, action, callback, obj) => {
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
