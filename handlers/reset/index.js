import { dataLib, userObj, randomID, sendSMS, sendEmail } from '../../lib'
import config from '../../config'

const sendEmailReset = (email, phone, callback) => {
  randomID(32, (code) => {
    if (code) {
      const subject = 'Please confirm your password reset';
      const msg = `Click here to confirm password reset: <a href="${config.baseUrl}?token=${code}">${code}</a>`;
      const obj = {
        phone,
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

const sendPhoneConfirmation = (phone, callback) => {
  randomID(6, (code) => {
    if (code) {
      const msg = `Your code for ${config.company} password reset: ${code}`
      const obj = {
        phone,
        type: 'reset',
        token: code,
        expiry: Date.now() + 1000 * 60 * 60
      };

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
    sendEmailReset(email, phone, (err) => {
      if (!err) {
        callback(false)
      } else {
        callback(err)
      }
    })
  } else if (config.mainConfirm === 'phone') {
    sendPhoneConfirmation(phone, (err) => {
      if (!err) {
        callback(false)
      } else {
        callback(err)
      }
    })
  }
}

export default (data, callback) => {
  const obj = userObj(data)
  if (obj.phone) {
    dataLib.read('users', obj.phone, (err, userData) => {
      if (!err && userData) {
        sendReset(userData.email, userData.phone, (err) => {
          if (!err.error) {
            callback(200)
          } else {
            callback(500, { error: `Cannot send email: ${err.error}` })
          }
        });
      } else {
        callback(400, { error: 'No such user.' });
      }
    })
  } else {
    callback(400, { error: 'Not all required fields provided.' })
  }
}
