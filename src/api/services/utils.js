const config = require('./../../config')

const jsonResponse = (data, message = '', code = 200) => {
    return {
        data: data,
        message: message,
        code: code
    }
}

const validateCurrency = (currency) => {
    let valid = false;
    const CURRENCIES = config.ALLOWED_CURRENCIES;
    if (CURRENCIES && CURRENCIES.length > 0) {
        valid = CURRENCIES.filter(x => x === currency).length > 0;
    }
    return valid;
}

const validateMemo = (memo) => {
    let valid = false;
    if (memo.substring(0, 1) === '#'
        && memo.length > 80
        && !memo.substring(0, 50).includes(' ')) {
        valid = true;
    }
    return valid;
}

module.exports = {
    jsonResponse,
    validateCurrency,
    validateMemo
}