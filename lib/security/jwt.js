import { readFileSync } from 'fs';
import { join } from 'path';
import { createSign, createVerify } from 'crypto';

import { config } from '../../config';
const basePath = join(__dirname, '../../certs');
const privateKey = readFileSync(join(basePath, 'private.pem'), 'utf8');
const publicKey = readFileSync(join(basePath, 'public.pem'), 'utf8');
const algo = 'SHA256';
const pkObj = {
  privateKey: {
    key: privateKey,
    passphrase: config.privateKeySecret
  }
};

const sign = (data, callback) => {
  if (typeof data === 'object') {
    const signer = createSign(algo);
    const signature = signer.sign(pkObj, 'base64');
    data = JSON.stringify(data);
    signer.write(data);

    signer.on('error', (err) => {
      callback(true, { error: err });
    });

    signer.end();
    callback(false, signature);
  } else {
    callback(true, { error: 'Wrong payload for JWT.' });
  }
};

const verify = (data, callback) => {
  if (typeof data === 'string') {
    const signer = createSign(algo);
    const signature = signer.sign(pkObj, 'base64');
    const verifier = createVerify(algo);
    verifier.write(data);

    verifier.on('error', (err) => {
      callback(true, { error: err });
    });

    verifier.end();

    const verified = verifier.verify(publicKey, signature);

    callback(false, verified);
  } else {
    callback(true, { error: 'Wrong payload for JWT.' });
  }
};

export {
  sign,
  verify
};
