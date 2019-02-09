import randomID from '../../lib/security/randomID'
import config from '../../config'
import dataLib from '../../lib/data/functions'
import userObj from '../../lib/data/userObj'
import hash from '../../lib/security/hash'
import finalizeRequest from '../../lib/data/finalizeRequest'

const valid = (data) => {
  return typeof data.payload.tokenId === 'string' && data.payload.tokenId.trim().length === 64 ? data.payload.tokenId.trim() : false
}

export const get = (data, callback) => {
  if (valid(data)) {
    dataLib.read('tokens', data.payload.tokenId, (err, tokenData) => {
      if (!err && tokenData) {
        callback(200, tokenData)
      } else {
        callback(404, { error: `No such user, error: ${err.message}` })
      }
    })
  } else {
    callback(400, { error: 'Missing required field.' })
  }
}

export const create = (data, callback) => {
  const u = userObj(data)

  if ((u.email && u.password) || (u.phone && u.password)) {
    dataLib.read('users', u.email, (err, userData) => {
      if (!err && userData) {
        if (userData.confirmed.email || userData.confirmed.phone) {
          hash(u.password, (hashed) => {
            if (userData.password === hashed) {
              randomID(32, (tokenId) => {
                if (tokenId) {
                  const expiry = Date.now() + 1000 * config.tokenExpiry
                  const tokenObj = {
                    expiry,
                    tokenId,
                    role: userData.role,
                    email: u.email
                  }
                  finalizeRequest('tokens', tokenId, 'create', callback, tokenObj)
                } else {
                  callback(400, { error: 'Cannot get unique ID.' })
                }
              })
            } else {
              callback(401, { error: 'Invalid password.' })
            }
          })
        } else {
          callback(400, { error: 'User\'s account is not confirmed.' })
        }
      } else {
        callback(400, { error: 'Cannot find specified user.' })
      }
    })
  } else {
    callback(400, { error: 'Missing required fields.' })
  }
}

export const extend = (data, callback) => {
  const id = valid(data)
  if (id) {
    dataLib.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        if (tokenData.expiry > Date.now()) {
          tokenData.expiry = Date.now() + 1000 * config.tokenExpiry
          finalizeRequest('tokens', id, 'update', callback, tokenData)
        } else {
          callback(400, { error: 'Token is expired, please login again.' })
        }
      } else {
        callback(400, { error: 'Token doesn\'t exist.' })
      }
    })
  } else {
    callback(400, { error: 'Missing required fields or invalid.' })
  }
}

export const destroy = (data, callback) => {
  const token = valid(data)
  if (token) {
    dataLib.read('tokens', token, (err, data) => {
      if (!err && data) {
        finalizeRequest('tokens', token, 'delete', callback)
      } else {
        callback(404, { error: 'No such token.' })
      }
    })
  } else {
    callback(400, { error: 'Missing required field.' })
  }
}
