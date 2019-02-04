import { config } from '../../config';
import { sendTwilioSMS } from './twilio';

const sendSMS = config.mobileProvider === 'twilio' ? sendTwilioSMS : {};

export {
  sendSMS
};
