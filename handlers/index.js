const ACTIONS = require('../actions')

export default {
  [ACTIONS.CONFIRM.SEND]: require('./confirm'),
  [ACTIONS.REFER.REFER]: require('./refer').refer,
  [ACTIONS.REFER.USE]: require('./refer').use,
  [ACTIONS.REFER.REGISTER]: require('./refer').register,
  [ACTIONS.RESET.CREATE]: require('./reset'),
  [ACTIONS.PING]: require('./generics/ping'),
  [ACTIONS.NOT_FOUND]: require('./generics/notFound')
}
