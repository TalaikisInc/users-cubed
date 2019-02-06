import http from 'http'
import https from 'https'
import url from 'url'

import { logsWorker } from '../logs'
import { dataLib } from '../../data'
import { config } from '../../../config'
import { error, log } from '../../debug'
import { sendSMS } from '../../phone'

const urlsObj = (data) => {
  const id = typeof data.urlId === 'string' && data.urlId.trim().length > 0 ? data.urlId.trim() : false
  const phone = typeof data.phone === 'string' && data.phone.trim().length >= 11 ? data.phone.trim() : false
  const protocol = typeof data.protocol === 'string' && ['http', 'https'].indexOf(data.protocol) > -1 ? data.protocol.trim() : false
  const url = typeof data.url === 'string' && data.url.trim().length > 0 ? data.url.trim() : false
  const method = typeof data.method === 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(data.method) > -1 ? data.method.trim() : false
  const successCodes = typeof data.successCodes === 'object' && Array.isArray(data.successCodes) ? data.successCodes : false
  const timeout = typeof data.timeout === 'number' && data.timeout % 1 === 0 ? data.timeout : false
  return {
    id,
    protocol,
    url,
    phone,
    method,
    successCodes,
    timeout
  }
}

const urlWorker = {}

urlWorker.performCheck = (urlData) => {
  let outcomeSent = false

  let responseObj = {
    error: false,
    statusCode: false
  }

  const parsed = url.parse(`${urlData.protocol}://${urlData.url}`, true)
  const hostname = parsed.hostname
  const path = parsed.path

  const requestObj = {
    protocol: `${urlData.protocol}:`,
    hostname: hostname,
    method: urlData.method,
    timeout: urlData.timeout * 1000,
    path
  }

  const schema = urlData.protocol === 'https' ? https : http

  const req = schema.request(requestObj, (res) => {
    const status = res.statusCode
    responseObj.statusCode = status

    if (!outcomeSent) {
      urlWorker.processOutcome(urlData, responseObj)
      outcomeSent = true
    }
  })

  req.on('error', (err) => {
    responseObj.error = {
      error: true,
      value: err
    }

    if (!outcomeSent) {
      urlWorker.processOutcome(urlData, responseObj)
      outcomeSent = true
    }
  })

  req.on('timeout', (err) => {
    responseObj.error = {
      error: true,
      value: err
    }

    if (!outcomeSent) {
      urlWorker.processOutcome(urlData, responseObj)
      outcomeSent = true
    }
  })

  req.end()
}

urlWorker.processOutcome = (urlData, responseObj) => {
  const state = !responseObj.error && responseObj.statusCode && urlData.successCodes.indexOf(responseObj.statusCode) > -1 ? 'up' : 'down'
  const stateChanged = urlData.state !== state
  // alert when not the first run and state is changed
  const alertWarranted = urlData.lastChecked && stateChanged

  const newData = urlData
  newData.state = state
  newData.lastChecked = Date.now()

  if (alertWarranted) {
    urlWorker.alertUser(newData)
  }

  if (stateChanged) {
    dataLib.update('urls', urlData.urlId, newData, (err) => {
      if (!err) {
        log('URL updated.', 'FgGreen')
      } else {
        error(`Error trying to save updates for url: ${urlData.urlId}`)
      }
    })

    logsWorker.log(urlData, responseObj, state, alertWarranted, (err) => {
      if (err) {
        error(err)
      }
    })
  }
}

urlWorker.alertUser = (urlData) => {
  const msg = `${urlData.protocol}://${urlData.url} is currently ${urlData.state}`

  sendSMS(urlData.phone, msg, (err) => {
    if (!err.error) {
      log(`${urlData.phone} alerted on ${urlData.url}.`, 'FgGreen')
    } else {
      error(`${urlData.phone} wasn't alerted due ${err}`)
    }
  })
}

urlWorker.validate = (urlData) => {
  const valid = typeof urlData === 'object' && urlData !== null ? urlData : {}
  if (valid) {
    const { protocol, url, method, successCodes, timeout, phone } = urlsObj(urlData)
    const state = typeof urlData.state === 'string' && ['up', 'down'].indexOf(urlData.state) > -1 ? urlData.state.trim() : 'unknown'

    if (protocol && url && method && successCodes && timeout && state && phone) {
      urlData.state = state
      urlWorker.performCheck(urlData)
    } else {
      error('urlWorker.validate', 'One or more values from URL object is invalid.')
    }
  } else {
    error('Chek object is invalid.')
  }
}

urlWorker.execute = () => {
  dataLib.list('urls', (err, data) => {
    if (!err && data.length > 0) {
      data.forEach((url) => {
        dataLib.read('urls', url, (er, urlData) => {
          if (!er && urlData) {
            urlWorker.validate(urlData)
          } else {
            error(`Error rading: ${url}`)
          }
        })
      })
    } else {
      log(`Error rading directory or it is empty: ${err}`)
    }
  })
}

urlWorker.loop = () => {
  setInterval(() => {
    urlWorker.execute()
  }, 1000 * config.workers.checkEvery)
}

export {
  urlWorker
}
