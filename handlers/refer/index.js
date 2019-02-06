import { dataLib, uuidv4, tokenHeader, userObj, sendEmail, finalizeRequest } from '../../lib'
import { config } from '../../config'

const generateToken = (phone, callback) => {
  const token = uuidv4()
  const obj = {
    id: token,
    referral: phone,
    used: false,
    finalized: false
  }

  dataLib.create('refers', token, obj, (err) => {
    if (!err) {
      callback(false, token)
    } else {
      callback(true, err)
    }
  })
}

const sendReferEmail = (email, token, referringUser, callback) => {
  const subject = `${referringUser} is inviting you to join ${config.company}`
  const msg = `Click the following link: <a href="${config.baseUrl}?token=${token}">${token}</a>`

  sendEmail(email, subject, msg, (err) => {
    if (!err.error) {
      callback(false)
    } else {
      callback(err.error)
    }
  })
}

/**
  * @desc Referring user sends email to friend
  * @param object data - { headers: ( token: 'Bearer ...' ), phone: ..., refEmail: ... }
  * @return bool - success or failure with optional error object
*/
export const refer = (data, callback) => {
  const authToken = tokenHeader(data)
  if (authToken) {
    const uo = userObj(data)
    const refEmail = typeof data.payload.refEmail === 'string' && data.payload.refEmail.indexOf('@') > -1 ? data.payload.refEmail.trim() : false
    if (uo.phone && refEmail) {
      dataLib.read('users', uo.phone, (err, userData) => {
        if (!err && data) {
          generateToken(uo.phone, (err, refToken) => {
            if (!err) {
              userData.referred.push(refToken)
              userData.updatedAt = Date.now()

              const referringUser = `${userData.firstName} ${userData.lastName} <${userData.email}>`
              sendReferEmail(refEmail, refToken, referringUser, (err) => {
                if (!err) {
                  finalizeRequest('users', uo.phone, 'update', callback, userData)
                } else {
                  callback(400, { error: `Cannot send referral email: ${err}` })
                }
              })
            } else {
              callback(400, { error: `Cannot generate token: ${refToken}` })
            }
          })
        } else {
          callback(400, { error: 'No such user.' })
        }
      })
    } else {
      callback(400, { error: 'Not all data is provided.' })
    }
  } else {
    callback(403, { error: 'Wrong token provided.' })
  }
}

/**
  * @desc Referred user clicks his link
  * @param object data - { token: .... }
  * @return bool - success or failure with optional error object
*/
export const use = (data, callback) => {
  const token = typeof data.payload.token === 'string' && data.payload.token.length === 36 ? data.payload.token : false
  if (token) {
    dataLib.read('refers', token, (err, data) => {
      if (!err && data) {
        data.used = true
        finalizeRequest('refers', token, 'update', callback, data)
      } else {
        callback(403, { error: 'No such referral token.' })
      }
    })
  } else {
    callback(400, { error: 'Wrong data provided.' })
  }
}

/**
  * @desc After referred user registration we update refer object
  * @param object data - { token: ...., phone: ... }
  * @return bool - success or failure with optional error object
*/
export const register = (data, callback) => {
  const token = typeof data.payload.token === 'string' && data.payload.token.length === 36 ? data.payload.token : false
  const phone = typeof data.payload.phone === 'string' && data.payload.phone.length >= 11 ? data.payload.phone : false
  if (token && phone) {
    dataLib.read('users', phone, (err, userData) => {
      if (!err && userData) {
        dataLib.read('refers', token, (err, tokenData) => {
          if (!err && tokenData) {
            if (!userData.referred.includes(token)) {
              userData.referred.push(token)
              userData.updatedAt = Date.now()
              dataLib.update('users', phone, userData, (err) => {
                if (!err) {
                  tokenData.finalized = true
                  finalizeRequest('refers', token, 'update', callback, tokenData)
                } else {
                  callback(500, { error: 'Cannot update user.' })
                }
              })
            } else {
              callback(400, { error: 'Referred user already registered.' })
            }
          } else {
            callback(400, { error: 'Cannot find referral token.' })
          }
        })
      } else {
        callback(400, { error: 'No such user' })
      }
    })
  } else {
    callback(400, { error: 'Wrong data provided.' })
  }
}
