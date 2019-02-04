import { generateKeyPair } from 'crypto';
import { open } from 'fs';
import { join } from 'path';

import { config } from '../../config';
import { error, log } from '../debug';
import { write } from '../data';

const certDir = join(__dirname, '../../certs');

const keyPair = () => {
  const opts = {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'pkcs1',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
      cipher: 'aes-256-cbc',
      passphrase: config.privateKeySecret
    }
  };

  generateKeyPair('rsa', opts, (err, publicKey, privateKey) => {
    if (!err) {
      open(join(certDir, 'public.pem'), 'w', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
          write(fileDescriptor, publicKey, (err) => {
            if (!err) {
              log('Wrote public key.', 'FgGreen');
            } else {
              error(err);
            }
          });
        } else {
          error(`Cannot create public cert file: ${err}`);
        }
      });

      open(join(certDir, 'private.pem'), 'w', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
          write(fileDescriptor, privateKey, (err) => {
            if (!err) {
              log('Wrote private key.', 'FgGreen');
            } else {
              error(err);
            }
          });
        } else {
          error(`Cannot create private cert file: ${err}`);
        }
      });
    } else {
      error(err);
    }
  });
};

export {
  keyPair
};
