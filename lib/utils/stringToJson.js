export default (msg, cb) => {
  try {
    cb(JSON.parse(msg))
  } catch (e) {
    cb(msg)
  }
}
