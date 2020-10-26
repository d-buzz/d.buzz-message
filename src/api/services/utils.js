const config = require("../config/appConfig");
const CONSTANTS = require("../config/constants");
const jwt = require("jsonwebtoken");
const Cryptr = require('cryptr');
const cryptr = new Cryptr(config.CRYPTR_SECRET_KEY);

const jsonResponse = (
  data,
  message = "",
  code = CONSTANTS.SERVER_OK_HTTP_CODE
) => {
  return {
    data: data,
    message: message,
    code: code,
  };
};

const validateCurrency = (currency) => {
  let valid = false;
  const CURRENCIES = config.ALLOWED_CURRENCIES;
  if (CURRENCIES && CURRENCIES.length > 0) {
    valid = CURRENCIES.filter((x) => x === currency).length > 0;
  }
  return valid;
};

const validateMemo = (memo) => {
  let valid = false;
  if (
    memo.substring(0, 1) === "#" &&
    memo.length > 80 &&
    !memo.substring(0, 50).includes(" ")
  ) {
    valid = true;
  }
  return valid;
};

const generateJwt = (username, posting_key) => {
  const payload = { username, hash: encryptPassword(posting_key) };
  const token = jwt.sign(payload, config.JWT_SECRET_KEY, { expiresIn: "1d" });
  return token;
};

const validateJwt = (token) => {
  return jwt.verify(token, config.JWT_SECRET_KEY);
};

const encryptPassword = (password) => {
    return cryptr.encrypt(password)
}

const decryptPassword = (hash) => {
  return cryptr.decrypt(hash);
}

const sortArrayObject = (arr,key,sort='desc') => {
  if(sort==='desc'){
    arr = arr.sort(function(a,b){
      return b[key] - a[key];
    })
  }else if(sort==='asc'){
    arr = arr.sort(function(a,b){
      return a[key] - b[key];
    })
  }

  return arr;
}

module.exports = {
  jsonResponse,
  validateCurrency,
  validateMemo,
  generateJwt,
  validateJwt,
  encryptPassword,
  decryptPassword,
  sortArrayObject
};
