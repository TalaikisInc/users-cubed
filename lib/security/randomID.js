import { randomBytes } from 'crypto'

export default (n, callback) => {
  randomBytes(n, (err, buf) => {
    if (err) {
      callback(false)
    } else {
      callback(buf.toString('hex'))
    }
  })
}
