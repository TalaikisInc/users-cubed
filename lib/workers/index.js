import logsWorker from './logs'
import tokenWorker from './tokens'
import unconfirmedWorker from './unconfirmed_clean'

const workers = {}

workers.init = () => {
  tokenWorker.loop()
  logsWorker.loop()
  unconfirmedWorker.loop()
}

export default workers
