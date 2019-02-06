import { strictEqual } from 'assert'

import { config } from '../../config'
import { request } from '../utils'

strictEqual(typeof config.twilio.sid, 'string')
strictEqual(typeof config.twilio.authToken, 'string')

const sendTwilioSMS = (phone, msg, callback) => {
  const validPhone = typeof phone === 'string' && phone.length >= 11 ? phone : false
  const validMsg = typeof msg === 'string' && msg.trim().length > 0 ? msg.trim() : false

  if (validPhone && validMsg) {
    const obj = {
      protocol: 'https:',
      hostname: 'api.twilio.com',
      method: 'POST',
      path: `/2010-04-01/Accounts/${config.twilio.sid}/Messages.json`,
      data: {
        From: config.twilio.from,
        To: `+${phone}`,
        Body: msg
      },
      headers: {
        'Authorization': `Basic ${Buffer.from(`${config.twilio.sid}:${config.twilio.authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }

    request('https', obj, (err) => {
      if (!err) {
        callback(false)
      } else {
        callback(err)
      }
    })
  } else {
    callback({ error: 'Send SMS parameters missing or are invalid.' })
  }
}

export {
  sendTwilioSMS
}
