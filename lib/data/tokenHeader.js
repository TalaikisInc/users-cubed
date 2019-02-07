export default (data) => {
  if (data.headers) {
    return typeof data.headers.authorization === 'string' && data.headers.authorization.replace('Bearer ', '').length === 64 ? data.headers.authorization.replace('Bearer ', '') : false
  } else {
    return false
  }
}
