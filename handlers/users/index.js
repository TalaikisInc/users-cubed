import { validate } from 'isemail'

import { joinDelete, auth } from '../../lib'
import finalizeRequest from '../../lib/data/finalizeRequest'
import dataLib from '../../lib/data/functions'
import userObj from '../../lib/data/userObj'
import hash from '../../lib/security/hash'
import config from '../../config'
import randomID from '../../lib/security/randomID'
import sendEmail from '../../lib/email'
import sendSMS from '../../lib/phone'
import log from '../../lib/debug/log'
import error from '../../lib/debug/error'

const sendEmailConfirmation = (email, callback) => {
  randomID(32, (code) => {
    if (code) {
      const subject = 'Please confirm your account'
      const msg = `Your code for ${config.company} account: <a href="${config.baseUrl}?token=${code}">${code}</a>`
      const obj = {
        email,
        token: code,
        type: config.mainConfirm,
        expiry: Date.now() + 1000 * 60 * 60
      }

      dataLib.create('confirms', code, obj, (err) => {
        if (!err) {
          sendEmail(email, subject, msg, (err) => {
            if (!err.error) {
              callback(false)
            } else {
              callback(err)
            }
          })
        } else {
          callback('Unable to save confirmation code.')
        }
      })
    } else {
      callback('Unable to generate confirmation code.')
    }
  })
}

const sendPhoneConfirmation = (phone, email, callback) => {
  randomID(6, (code) => {
    if (code) {
      const msg = `Your code for ${config.company} account: ${code}`
      const obj = {
        email,
        token: code,
        expiry: Date.now() + 1000 * 60 * 60
      }

      dataLib.create('confirms', code, obj, (err) => {
        if (!err) {
          sendSMS(phone, msg, (err) => {
            if (!err.error) {
              callback(false)
            } else {
              callback(err)
            }
          })
        } else {
          callback('Unable to save confirmation code.')
        }
      })
    } else {
      callback('Unable to generate confirmation code.')
    }
  })
}

export const get = (data, callback) => {
  if (validate(data.payload.email)) {
    auth(data, (tokenData) => {
      if (tokenData) {
        dataLib.read('users', data.payload.email, (err, userData) => {
          if (!err && userData) {
            delete userData.password
            callback(200, userData)
          } else {
            callback(404, { error: 'No such user.' })
          }
        })
      } else {
        callback(403, { error: 'Unauthorized.' })
      }
    })
  } else {
    callback(400, { error: 'Missing required field.' })
  }
}

const createUser = (obj, callback) => {
  hash(obj.password, (hashedPassword) => {
    if (hashedPassword) {
      const now = Date.now()
      const newObj = {
        firstName: obj.firstName,
        lastName: obj.lastName,
        phone: obj.phone,
        email: obj.email,
        tosAgreement: obj.tosAgreement,
        password: hashedPassword,
        referred: [],
        address: obj.address,
        city: obj.city,
        country: obj.country,
        confirmed: {
          email: false,
          phone: false
        },
        registeredAt: now,
        updatedAt: now,
        role: 'user'
      }
  
      dataLib.create('users', obj.email, newObj, (err) => {
        if (!err) {
          if (config.mainConfirm === 'email') {
            sendEmailConfirmation(obj.email, (err) => {
              if (!err.error) {
                callback(false)
              } else {
                callback(`Could not send email: ${err.error}`)
              }
            })
          }

          if (config.mainConfirm === 'phone') {
            sendPhoneConfirmation(obj.phone, obj.email, (err) => {
              if (!err.error) {
                callback(false)
              } else {
                callback(`Could not send SMS: ${err.error}`)
              }
            })
          }
        } else {
          callback('Could not create user.')
        }
      })
    } else {
      callback('Could not hash password.')
    }
  })
}

export const create = (data, callback) => {
  const u = userObj(data)

  if (u.firstName && u.lastName && u.email && u.password && u.tosAgreement) {
    dataLib.read('users', u.email, (err, _) => {
      if (err) {
        createUser(u, (err) => {
          if (!err) {
            callback(200)
          } else {
            callback(500, { error: err })
          }
        })
      } else {
        callback(400, { error: 'User exists.' })
      }
    })
  } else {
    callback(400, { error: 'Missing required fields.' })
  }
}

export const edit = (data, callback) => {
  const u = userObj(data)

  if (u.email) {
    if (u.firstName || u.lastName || u.password || u.email) {
      auth(data, (tokenData) => {
        if (tokenData) {
          dataLib.read('users', u.email, (err, userData) => {
            if (!err && userData) {
              if (userData.confirmed.email || userData.confirmed.phone) {
                if (u.firstName !== userData.firstName) {
                  userData.firstName = u.firstName
                }

                if (u.address !== userData.address) {
                  userData.address = u.address
                }

                if (u.city !== userData.city) {
                  userData.city = u.city
                }

                if (u.country !== userData.country) {
                  userData.country = u.country
                }

                if (u.lastName !== userData.lastName) {
                  userData.lastName = u.lastName
                }

                if (u.email !== userData.email) {
                  data.email = u.email
                  sendEmailConfirmation(u.email, (err) => {
                    if (!err) {
                      log('Email sent.', 'FgGreen')
                    } else {
                      error(err)
                    }
                  })
                }

                if (u.password) {
                  hash(u.password, (hashed) => {
                    if (hashed) {
                      userData.password = hashed
                      userData.updatedAt = Date.now()
                      finalizeRequest('users', u.email, 'update', callback, data)
                    } else {
                      callback(500, { error: 'Unable to hash password' })
                    }
                  })
                } else {
                  userData.updatedAt = Date.now()
                  finalizeRequest('users', u.email, 'update', callback, data)
                }
              } else {
                callback(400, { error: 'Email or phone should be confirmed.' })
              }
            } else {
              callback(400, { error: 'Specified user doens not exist.' })
            }
          })
        } else {
          callback(403, { error: 'Unauthorized.' })
        }
      })
    } else {
      callback(400, { error: 'Missing reuired field(s).' })
    }
  } else {
    callback(400, { error: 'Missing reuired field.' })
  }
}

export const destroy = (data, callback) => {
  if (validate(data.payload.email)) {
    auth(data, (tokenData) => {
      if (tokenData) {
        dataLib.read('users', data.payload.email, (err, userData) => {
          if (!err && userData) {
            const refs = typeof userData.referred === 'object' && Array.isArray(userData.referred) ? userData.referred : []
            // delete any associated tables
            // const orders = typeof userData.orders === 'object' && Array.isArray(userData.orders) ? userData.orders : []

            dataLib.delete('users', data.payload.email, (err) => {
              if (!err) {
                joinDelete('refers', refs, (err) => {
                  if (err) {
                    error(err)
                  } else {
                    callback(200)
                  }
                })
              } else {
                callback(500, { error: 'Could not delete user.' })
              }
            })
          } else {
            callback(400, { error: 'No such user.' })
          }
        })
      } else {
        callback(403, { error: 'Unauthorized.' })
      }
    })
  } else {
    callback(400, { error: 'Missing required field.' })
  }
}
