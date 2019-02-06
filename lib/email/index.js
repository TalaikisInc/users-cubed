import { sendMailgunEmail } from './mailgun'
import { config } from '../../config'

const sendEmail = config.emailProvider === 'mailgun' ? sendMailgunEmail : {}

export {
  sendEmail
}
