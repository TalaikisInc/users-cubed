import { logsWorker } from './logs';
import { tokenWorker } from './tokens';
import { urlWorker } from './urls';
import { certWorker } from './certs';
import { unconfirmedWorker } from './unconfirmed_clean';

const workers = {};

workers.init = () => {
  urlWorker.loop();
  tokenWorker.loop();
  logsWorker.loop();
  certWorker.loop();
  unconfirmedWorker.loop();
};

export {
  workers
};
