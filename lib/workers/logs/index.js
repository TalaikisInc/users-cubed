import { log, logs } from '../../debug';
import { config } from '../../../config';

const logsWorker = {};

logsWorker.loop = () => {
  setInterval(() => {
    logs.rotate();
  }, 1000 * config.workers.logRotate);
};

logsWorker.log = (urlData, outcome, state, alertWarranted, callback) => {
  const dt = Date.now();
  const obj = {
    urlData,
    outcome,
    state,
    alertWarranted,
    date: dt
  };

  const logFile = urlData.urlId;
  const logString = JSON.stringify(obj, function replacer (key, value) { return value; });
  logs.append(logFile, logString, (err) => {
    if (!err) {
      log(`Wrote logs: ${logFile}`, 'FgGreen');
      callback(false);
    } else {
      callback(err);
    }
  });
};

export {
  logsWorker
};
