import { server, workers } from './lib'

const app = {}

app.init = () => {
  server.init()
  workers.init()
}

app.init()

export default app
