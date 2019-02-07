import { open, readFile, unlink, ftruncate, readdir } from 'fs'
import { join } from 'path'

import stringToJson from '../utils/stringToJson'
import write from './write'

const dataLib = {}

dataLib.baseDir = join(__dirname, '../../.data')

dataLib.create = (dir, file, data, callback) => {
  const dataDir = join(dataLib.baseDir, dir)
  // createDir(dataDir) @FIXME -> blocking -> nonblocking or leave manual
  open(join(dataDir, `${file}.json`), 'wx', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      const dataString = JSON.stringify(data)
      write(fileDescriptor, dataString, callback)
    } else {
      callback('Cannot create new file, it may exist already.')
    }
  })
}

dataLib.read = (dir, file, callback) => {
  readFile(join(dataLib.baseDir, dir, `${file}.json`), 'utf8', (err, data) => {
    if (!err && data) {
      stringToJson(data, (parsed) => {
        if (parsed) {
          callback(false, parsed)
        } else {
          callback({ error: 'Cannot parse json.' })
        }
      })
    } else {
      callback(err)
    }
  })
}

dataLib.update = (dir, file, data, callback) => {
  open(join(dataLib.baseDir, dir, `${file}.json`), 'r+', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      const dataString = JSON.stringify(data)
      ftruncate(fileDescriptor, () => {
        if (!err) {
          write(fileDescriptor, dataString, callback)
        } else {
          callback('Error truncating file.')
        }
      })
    } else {
      callback('Cannot open file for updating, file may not exist.')
    }
  })
}

dataLib.delete = (dir, file, callback) => {
  unlink(join(dataLib.baseDir, dir, `${file}.json`), (err) => {
    if (!err) {
      callback(false)
    } else {
      callback('Error deleting file.')
    }
  })
}

dataLib.list = (dir, callback) => {
  readdir(join(dataLib.baseDir, dir), (err, data) => {
    if (!err && data && data.length > 0) {
      const trimmedFilename = []
      data.forEach((filename) => {
        if (filename.indexOf('.json') > -1) {
          trimmedFilename.push(filename.replace('.json', ''))
        }
      })
      callback(false, trimmedFilename)
    } else {
      callback(err, data)
    }
  })
}

export default dataLib
