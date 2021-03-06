import validPhone from '../utils/validPhone'

export default (data) => {
  if (data.payload) {
    const phone = validPhone(data)
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
