import log from '../../lib/debug/log'
import error from '../../lib/debug/error'
import config from '../../config'
import dataLib from '../../lib/data/functions'
import finalizeRequest from '../../lib/data/finalizeRequest'
import hash from '../../lib/security/hash'
import randomID from '../../lib/security/randomID'
import sendEmail from '../../lib/email'

const token = (data) => {
  if (typeof data.payload === 'object') {
    return typeof data.payload.token === 'string' && data.payload.token.trim().length === 64 ? data.payload.token.trim() : false
  } else {
    return false
  }
}

const sendNewPassword = (email, password, callback) => {
  const subject = 'Your new password'
  const msg = `Your new password for ${config.company}: ${password}`
  sendEmail(email, subject, msg, (err) => {
    if (!err.error) {
      callback(false)
    } else {
      callback(err)
    }
  })
}

export default (data, callback) => {
  const id = token(data)
  if (id) {
    dataLib.read('confirms', id, (err, tokenData) => {
      if (!err && tokenData) {
        if (tokenData.expiry > Date.now()) {
          if (tokenData.token === id) {
            dataLib.read('users', tokenData.email, (err, userData) => {
              if (!err && userData) {
                if (tokenData.type === 'reset') {
                  randomID(16, (password) => {
                    if (password) {
                      hash(password, (hashed) => {
                        if (!hashed) {
                          callback(500, { error: 'Cannot hash password.' })
                        } else {
                          userData.password = hashed
                          userData.updatedAt = Date.now()
                          sendNewPassword(userData.email, password, (err) => {
                            if (!err) {
                              finalizeRequest('users', tokenData.email, 'update', callback, userData)
                            } else {
                              error(err)
                            }
                          })
                        }
                      })
                    } else {
                      callback(500, { error: 'Unable to generate new password' })
                    }
                  })
                } else if (tokenData.type === 'email' || tokenData.type === 'phone') {
                  userData.confirmed[tokenData.type] = true
                  finalizeRequest('users', tokenData.email, 'update', callback, userData)
                }
              } else {
                callback(400, { error: 'No such user.' })
              }
            })
          } else {
            callback(403, { error: 'Invalid token.' })
          }
        } else {
          callback(403, { error: 'Token is expired.' })
        }
      } else {
        callback(403, { error: 'Token not found.' })
      }
    })
  } else {
    callback(400, { error: 'Not all required fields provided.' })
  }
}
