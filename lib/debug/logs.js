import { gzip, unzip } from 'zlib'
import { open, appendFile, readdir, readFile, ftruncate } from 'fs'
import { join } from 'path'

import { log, error } from './../debug'
import { write, closeFile } from './../data'

const logs = {}

logs.baseDir = join(__dirname, '../../.logs')

logs.append = (file, msg, callback) => {
  open(join(logs.baseDir, `${file}.log`), 'a', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      appendFile(fileDescriptor, `${msg}\n`, (err) => {
        if (!err) {
          closeFile(fileDescriptor, callback)
        } else {
          callback(`Cannot append to log file: ${err.message}`)
        }
      })
    } else {
      callback(`Cannot open log file: ${err.message}`)
    }
  })
}

logs.list = (include, callback) => {
  readdir(logs.baseDir, (err, data) => {
    if (!err && data && data.length > 0) {
      const trimmed = []
      data.forEach((fileName) => {
        if (fileName.indexOf('.log') > -1) {
          trimmed.push(fileName.replace('.log', ''))
        }

        if (fileName.indexOf('.gz.b64' && include) > -1) {
          trimmed.push(fileName.replace('.gz.b64', ''))
        }
        callback(false, trimmed)
      })
    } else {
      callback(err, data)
    }
  })
}

logs.rotate = () => {
  logs.list(false, (err, logs) => {
    if (!err && logs && logs.length > 0) {
      logs.forEach((logName) => {
        if (logName !== '.gitkeep') {
          const logId = logName.replace('.log', '')
          const dt = Date.now()
          const compressedName = `${logId}_${dt}`
          compress(logId, compressedName, (err) => {
            if (!err) {
              truncateFiles(logId, (err) => {
                if (!err) {
                  log('Logs truncated,', 'FgGreen')
                } else {
                  error(`Truncating log error: ${err.message}`)
                }
              })
            } else {
              error(`Compression error: ${err.message}`)
            }
          })
        }
      })
    } else {
      log('No logs to rotate.')
    }
  })
}

const compress = (logId, compressedId, callback) => {
  const sourceFile = `${logId}.log`
  const destFile = `${compressedId}.gz.b64`

  readFile(join(logs.baseDir, sourceFile), 'utf8', (err, inputStr) => {
    if (!err && inputStr) {
      gzip(inputStr, (err, buffer) => {
        if (!err && buffer) {
          open(join(logs.baseDir, destFile), 'wx', (err, fileDescriptor) => {
            if (!err && fileDescriptor) {
              write(fileDescriptor, buffer.toString('base64'), callback)
            } else {
              callback(err)
            }
          })
        } else {
          callback(err)
        }
      })
    } else {
      callback(err)
    }
  })
}

const truncateFiles = (logId, callback) => {
  const sourceFile = join(logs.baseDir, `${logId}.log`)
  open(sourceFile, 'r+', (err, descriptor) => {
    if (!err && descriptor) {
      ftruncate(descriptor, 0, (err) => {
        if (!err) {
          callback(false)
        } else {
          callback(err)
        }
      })
    } else {
      callback(err)
    }
  })
}

logs.decompress = (fileId, callback) => {
  const destFile = `${fileId}.gz.b64`
  readFile(join(logs.baseDir, destFile), 'utf8', (err, str) => {
    if (!err && str) {
      const buffer = Buffer.from(str, 'base64')
      unzip(buffer, (err, ouputBuffer) => {
        if (!err && ouputBuffer) {
          const strOutput = ouputBuffer.toString()
          callback(false, strOutput)
        } else {
          callback(err)
        }
      })
    } else {
      callback(err)
    }
  })
}

export {
  logs
}
