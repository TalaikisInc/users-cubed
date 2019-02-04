import { writeFile, close } from 'fs'

const closeFile = (descriptor, callback) => {
  close(descriptor, (err) => {
    if (!err) {
      callback(false)
    } else {
      callback(`Error closing file: ${err.message}`)
    }
  })
}

const write = (descriptor, data, callback) => {
  writeFile(descriptor, data, (err) => {
    if (!err) {
      close(descriptor, callback)
    } else {
      callback(`Error writing file: ${err.message}`)
    }
  })
}

export {
  closeFile,
  write
}
