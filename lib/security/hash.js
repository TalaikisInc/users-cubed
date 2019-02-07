import { createHmac } from 'crypto'

import config from '../../config'

export default (msg, cb) => {
  if (typeof msg === 'string' && msg.length > 0) {
    cb(createHmac('sha256', config.hashingSecret).update(msg).digest('hex'))
  } else {
    cb(false)
  }
}
