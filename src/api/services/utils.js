const dhive = require('@hiveio/dhive');
const config = require('./../../config')

const jsonResponse = (data, message='', code=200) => {
    return {
        data: data,
        message: message,
        code: code
    }
}

const dhiveClientConnect = (node='', timeout=10) => {
    const current_node = node ? node : config.NODE_DEFAULT
    return new dhive.Client(current_node, { timeout: timeout * 1000 });
}

const getPrivateKeys = (account, password, key_type) => {
    return dhive.PrivateKey.fromLogin(account,password,key_type).toString();
}

module.exports = {
    jsonResponse,
    dhiveClientConnect,
    getPrivateKeys
}