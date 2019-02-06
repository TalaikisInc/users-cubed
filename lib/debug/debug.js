import { debuglog } from 'util'

import { config } from '../../config'
import { colors } from '../utils'
const namespace = 'APP'

const log = (msg, color) => {
  if (config.logging) {
    const debug = debuglog(namespace)
    const dt = Date(Date.now()).toString()
    msg = typeof msg === 'object' ? msg : `${dt}: ${msg}`
    color = typeof color === 'string' ? color : 'FgWhite'
    debug(colors[color], msg)
  }
}

const error = (msg) => {
  if (config.logging) {
    const debug = debuglog(namespace)
    const dt = Date(Date.now()).toString()
    msg = typeof msg === 'object' ? msg : `${dt}: ${msg}`
    debug(colors.FgRed, msg)
  }
}

export {
  log,
  error
}
