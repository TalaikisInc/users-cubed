import { existsSync, mkdir } from 'fs';

const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const stringToJson = (msg, cb) => {
  try {
    return cb(JSON.parse(msg));
  } catch (e) {
    return cb(msg);
  }
};

const createDir = (dir) => {
  if (!existsSync(dir)) {
    mkdir(dir, (err) => {
      if (!err) {
        return true;
      } else {
        return false;
      }
    });
  }
};

const randomString = (n) => {
  const valid = typeof n === 'number' && n > 0 ? n : false;
  if (valid) {
    let out = '';
    const possible = 'abcdefghijklmnoprstuvzyxwqABCDEFGHIJKLMNOPRSTUVVZXWQY1234567890';
    for (let i = 0; i < n; i += 1) {
      let chosen = possible.charAt(Math.floor(Math.random() * possible.length));
      out += chosen;
    }
    return out;
  } else {
    return false;
  }
};

const isURL = (string) => {
  const res = /^(?:\w+:)?\/\/([^\s.]+\.\S{2}|localhost[:?\d]*)\S*$/.test(string);
  if (res == null) {
    return false;
  } else {
    return true;
  }
};

export {
  stringToJson,
  createDir,
  randomString,
  uuidv4,
  isURL
};
