import { existsSync, mkdir } from 'fs'

export const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export const createDir = (dir) => {
  if (!existsSync(dir)) {
    mkdir(dir, (err) => {
      if (!err) {
        return true
      } else {
        return false
      }
    })
  }
}

export const randomString = (n) => {
  const valid = typeof n === 'number' && n > 0 ? n : false
  if (valid) {
    let out = ''
    const possible = 'abcdefghijklmnoprstuvzyxwqABCDEFGHIJKLMNOPRSTUVVZXWQY1234567890'
    for (let i = 0; i < n; i += 1) {
      let chosen = possible.charAt(Math.floor(Math.random() * possible.length))
      out += chosen
    }
    return out
  } else {
    return false
  }
}
