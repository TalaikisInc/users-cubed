import { config } from '../../../config';
import { keyPair } from '../../security';

const certWorker = {};

certWorker.rotate = () => {
  keyPair();
};

certWorker.loop = () => {
  setInterval(() => {
    certWorker.rotate();
  }, 1000 * config.workers.certsRotate);
};

export {
  certWorker
};
