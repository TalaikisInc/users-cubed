import { writeFile } from 'fs'

import close from './close'

export default (descriptor, data, callback) => {
  writeFile(descriptor, data, (err) => {
    if (!err) {
      close(descriptor, callback)
    } else {
      callback(`Error writing file: ${err.message}`)
    }
  })
}
