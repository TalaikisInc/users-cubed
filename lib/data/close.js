import { close } from 'fs'

export default (descriptor, callback) => {
  close(descriptor, (err) => {
    if (!err) {
      callback(false)
    } else {
      callback(`Error closing file: ${err.message}`)
    }
  })
}
