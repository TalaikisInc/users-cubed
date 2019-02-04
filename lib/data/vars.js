const tokenHeader = (data) => {
  if (data.headers) {
    return typeof data.headers.authorization === 'string' && data.headers.authorization.replace('Bearer ', '').length === 64 ? data.headers.authorization.replace('Bearer ', '') : false
  } else {
    return false
  }
}

const validURL = (data) => {
  if (data.payload) {
    return typeof data.payload.urlId === 'string' && data.payload.urlId.trim() === 36 ? data.payload.urlId.trim() : false
  } else {
    return false
  }
}

const validPhone = (data) => {
  if (data.payload) {
    return typeof data.payload.phone === 'string' && data.payload.phone.trim().length >= 11 ? data.payload.phone.trim() : false
  } else {
    return false
  }
}

const userObj = (data) => {
  const phone = validPhone(data)
  if (data.payload) {
    const firstName = typeof data.payload.firstName === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false
    const lastName = typeof data.payload.lastName === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false
    const email = typeof data.payload.email === 'string' && data.payload.email.trim().length > 0 && data.payload.email.indexOf('@') > -1 ? data.payload.email.trim() : false
    const password = typeof data.payload.password === 'string' && data.payload.password.trim().length > 12 ? data.payload.password.trim() : false
    const tosAgreement = typeof data.payload.tosAgreement === 'boolean' && data.payload.tosAgreement === true ? data.payload.tosAgreement : false
    const address = typeof data.payload.address === 'string' && data.payload.address.trim().length > 0 ? data.payload.address.trim() : false
    const city = typeof data.payload.city === 'string' && data.payload.city.trim().length > 0 ? data.payload.city.trim() : false
    const country = typeof data.payload.country === 'string' && data.payload.country.trim().length > 0 ? data.payload.country.trim() : false

    return {
      phone,
      firstName,
      lastName,
      email,
      password,
      tosAgreement,
      address,
      city,
      country
    }
  } else {
    return false
  }
}

const urlsObj = (data) => {
  if (data.payload) {
    const id = validURL(data)
    const protocol = typeof data.payload.protocol === 'string' && ['http', 'https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol.trim() : false
    const url = typeof data.payload.url === 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false
    const method = typeof data.payload.method === 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(data.payload.method) > -1 ? data.payload.method.trim() : false
    const successCodes = typeof data.payload.successCodes === 'object' && Array.isArray(data.payload.successCodes) ? data.payload.successCodes : false
    const timeout = typeof data.payload.timeout === 'number' && data.payload.timeout % 1 === 0 ? data.payload.timeout : false
    return {
      id,
      protocol,
      url,
      method,
      successCodes,
      timeout
    }
  } else {
    return false
  }
}

const statusCodes = {
  100: 'Continue',
  101: 'Switching Protocols',
  102: 'Processing (WebDAV; RFC 2518)',
  103: 'Early Hints (RFC 8297)',
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-Authoritative Information (since HTTP/1.1)',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content (RFC 7233)',
  207: 'Multi-Status (WebDAV; RFC 4918)',
  208: 'Already Reported (WebDAV; RFC 5842)',
  218: 'This is fine (Apache Web Server)',
  226: 'IM Used (RFC 3229)',
  300: 'Multiple Choices',
  301: 'Moved Permanently',
  302: 'Found (Previously "Moved temporarily")',
  303: 'See Other (since HTTP/1.1)',
  304: 'Not Modified (RFC 7232)',
  305: 'Use Proxy (since HTTP/1.1)',
  306: 'Switch Proxy',
  307: 'Temporary Redirect (since HTTP/1.1)',
  308: 'Permanent Redirect (RFC 7538)',
  400: 'Bad Request',
  401: 'Unauthorized (RFC 7235)',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required (RFC 7235)',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed (RFC 7232)',
  413: 'Payload Too Large (RFC 7231)',
  414: 'URI Too Long (RFC 7231)',
  415: 'Unsupported Media Type',
  416: 'Range Not Satisfiable (RFC 7233)',
  417: 'Expectation Failed',
  418: 'I\'m a teapot (RFC 2324, RFC 7168)',
  419: 'Page Expired (Laravel Framework)',
  420: 'Method Failure (Spring Framework) / Enhance Your Calm (Twitter)',
  421: 'Misdirected Request (RFC 7540)',
  422: 'Unprocessable Entity (WebDAV; RFC 4918)',
  423: 'Locked (WebDAV; RFC 4918)',
  424: 'Failed Dependency (WebDAV; RFC 4918)',
  426: 'Upgrade Required',
  428: 'Precondition Required (RFC 6585)',
  429: 'Too Many Requests (RFC 6585)',
  431: 'Request Header Fields Too Large (RFC 6585)',
  440: 'Login Time-out',
  444: 'No Response',
  449: 'Retry With',
  450: 'Blocked by Windows Parental Controls (Microsoft)',
  451: 'Redirect / Unavailable For Legal Reasons (RFC 7725)',
  498: 'Invalid Token',
  494: 'Request header too large',
  495: 'SSL Certificate Error',
  496: 'SSL Certificate Required',
  497: 'HTTP Request Sent to HTTPS Port',
  499: 'Token Required (Esri) / Client Closed Request',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  506: 'Variant Also Negotiates (RFC 2295)',
  507: 'Insufficient Storage (WebDAV; RFC 4918)',
  508: 'Loop Detected (WebDAV; RFC 5842)',
  509: 'Bandwidth Limit Exceeded (Apache Web Server/cPanel)',
  510: 'Not Extended (RFC 2774)',
  511: 'Network Authentication Required (RFC 6585)',
  520: 'Unknown Error',
  521: 'Web Server Is Down',
  522: 'Connection Timed Out',
  523: 'Origin Is Unreachable',
  524: 'A Timeout Occurred',
  525: 'SSL Handshake Failed',
  526: 'Invalid SSL Certificate',
  527: 'Railgun Error',
  530: 'Site is frozen / Origin DNS Error',
  598: '(Informal convention) Network read timeout error'
}

export {
  tokenHeader,
  userObj,
  urlsObj,
  validPhone,
  statusCodes,
  validURL
}
