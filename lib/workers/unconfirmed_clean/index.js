import { dataLib } from '../../data';
import { error, log } from '../../debug';
import { config } from '../../../config';

const unconfirmedWorker = {};

unconfirmedWorker.check = (data) => {
  const id = typeof data.token === 'string' && data.token.length === 64 ? data.token : false;
  const phone = typeof data.phone === 'string' && data.phone.length >= 11 ? data.phone : false;

  if (id && phone) {
    if (data.expiry < Date.now()) {
      dataLib.delete('confirms', id, (err) => {
        if (!err) {
          dataLib.read('users', phone, (err, data) => {
            if (!err && data) {
              if ((!data.confirmed.email && config.mainConfirm === 'email') || (!data.confirmed.phone && config.mainConfirm === 'phone')) {
                dataLib.delete('users', phone, (err) => {
                  if (!err) {
                    log('User deleted.', 'FgGreen');
                  } else {
                    error(`Error deleting user: ${err}`);
                  }
                });
              }
            } else {
              error(`Error getting user: ${err}`);
            }
          });
        } else {
          error(`Error deleting token: ${err}`);
        }
      });
    }
  }
};

unconfirmedWorker.cleaner = () => {
  dataLib.list('confirms', (err, data) => {
    if (!err && data.length > 0) {
      data.forEach((el) => {
        dataLib.read('tokens', el, (er, elData) => {
          if (!er && elData) {
            unconfirmedWorker.check(elData);
          } else {
            error(`Error reading: ${el}`);
          }
        });
      });
    } else {
      error(`Error reading directory or empty: ${err}`);
    }
  });
};

unconfirmedWorker.loop = () => {
  setInterval(() => {
    unconfirmedWorker.cleaner();
  }, 1000 * config.workers.unconfirmedClean);
};

export {
  unconfirmedWorker
};
