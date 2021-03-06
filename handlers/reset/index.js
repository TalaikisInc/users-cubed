import config from '../../config'
import dataLib from '../../lib/data/functions'
import userObj from '../../lib/data/userObj'
import randomID from '../../lib/security/randomID'
import sendEmail from '../../lib/email'
import sendSMS from '../../lib/phone'

const sendEmailReset = (email, callback) => {
  randomID(32, (code) => {
    if (code) {
      const subject = 'Please confirm your password reset'
      const msg = `Click here to confirm password reset: <a href="${config.baseUrl}?token=${code}">${code}</a>`
      const obj = {
        email,
        type: 'reset',
        token: code,
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
      const msg = `Your code for ${config.company} password reset: ${code}`
      const obj = {
        email,
        type: 'reset',
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

const sendReset = (email, phone, callback) => {
  if (config.mainConfirm === 'email') {
    sendEmailReset(email, (err) => {
      if (!err) {
        callback(false)
      } else {
        callback(err)
      }
    })
  } else if (config.mainConfirm === 'phone') {
    sendPhoneConfirmation(phone, email, (err) => {
      if (!err) {
        callback(false)
      } else {
        callback(err)
      }
    })
  }
}

export default (data, callback) => {
  const u = userObj(data)
  if (u.email) {
    dataLib.read('users', u.email, (err, userData) => {
      if (!err && userData) {
        sendReset(u.email, userData.phone, (err) => {
          if (!err.error) {
            callback(200)
          } else {
            callback(500, { error: `Cannot send email: ${err.error}` })
          }
        })
      } else {
        callback(400, { error: 'No such user.' })
      }
    })
  } else {
    callback(400, { error: 'Not all required fields provided.' })
  }
}
