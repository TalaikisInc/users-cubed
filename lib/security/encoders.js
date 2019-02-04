import { createHmac, randomBytes, createCipher, createDecipher } from 'crypto';

import { config } from '../../config';

const hash = (msg) => {
  if (typeof msg === 'string' && msg.length > 0) {
    return createHmac('sha256', config.hashingSecret).update(msg).digest('hex');
  } else {
    return false;
  }
};

const randomID = (n, callback) => {
  randomBytes(n, (err, buf) => {
    if (err) {
      callback(false);
    } else {
      callback(buf.toString('hex'));
    }
  });
};

const encrypt = (msg, password, callbac) => {
  const cipher = createCipher('aes256', password);
  let encrypted = '';

  cipher.on('readable', () => {
    const data = cipher.read();
    if (data) {
      encrypted += data.toString('hex');
    }
  });

  cipher.on('end', () => {
    callbac(encrypted);
  });

  cipher.write(msg);
  cipher.end();
};

const decrypt = (encrypted, password, callbac) => {
  const decipher = createDecipher('aes256', password);
  let decrypted = '';

  decipher.on('readable', () => {
    const data = decipher.read();
    if (data) {
      decrypted += data.toString('utf8');
    }
  });

  decipher.on('end', () => {
    callbac(decrypted);
  });

  decipher.write(encrypted, 'hex');
  decipher.end();
};

export {
  hash,
  randomID,
  encrypt,
  decrypt
};
