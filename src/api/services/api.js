const config = require('./../../config')
const hive = require('@hiveio/hive-js');
const dhive = require('@hiveio/dhive');
const nodes = [
    "https://api.hive.blog",
    "https://api.hivekings.com",
    "https://anyx.io",
    "https://api.openhive.network"
]
const default_node = config.NODE_DEFAULT || nodes[0];
const dhiveClient = (node='', timeout=10) => {
    const current_node = node ? node : default_node;
    return new dhive.Client(current_node, { timeout: timeout * 1000 });
}

const getAccount = async (account) => {
    let response = { data: null, error: null }
    try {
        const acc = await dhiveClient().database.getAccounts([account])
        if (acc && acc[0]) {
            response.data = acc[0];
        } else {
            response.error = 'No data fetched';
        }
    } catch (error) {
        response.error = error ? error : 'No data fetched';
    }
    return response;
}

const getPrivateKeysFromLogin = (account, password) => {
    let response = { data: null, error: null }
    let keys = { active: '', memo: '' }
    try {
        keys.active = dhive.PrivateKey.fromLogin(account, password, 'active').toString();
        keys.memo = dhive.PrivateKey.fromLogin(account, password, 'memo').toString();
        response.data = keys;
    } catch (error) {
        response.error = error ? error : 'Invalid private key';
    }

    return response;
}

const getPrivateKeysFrom = (key) => {
    let response = { data: null, error: null }
    try {
        const private_key = dhive.PrivateKey.from(key)
        if (private_key) {
            response.data = private_key;
        } else {
            response.error = 'No data fetched';
        }
    } catch (error) {
        response.error = error ? error : 'Invalid private key';
    }
    return response;
}

const testKey = (key, key_auths) => {
    let response = { data: false, error: null }
    try {
        let pub = hive.auth.wifToPublic(key);
        let filter = key_auths.filter(x => x[0] === pub);
        response.data = filter.length > 0;
    } catch (error) {
        response.error = error;
    }
    return response;
}

const setAmountAsset = (amount, asset) => {
    let response = { data: null, error: null }
    amount = parseFloat(amount);
    try {
        const famount = dhive.Asset.from(amount, asset);
        response.data = famount;
    } catch (error) {
        response.error = error ? error : 'Set amount asset failed';
    }
    return response;
}

const encryptMessage = (memo_key_from, memo_key_to, message) => {
    let response = { data: null, error: null }
    try {
        let encodedMsg = hive.memo.encode(memo_key_from, memo_key_to, '# ' + message);
        if (encodedMsg) {
            response.data = encodedMsg;
        } else {
            response.error = 'Message encryption failed';
        }
    } catch (error) {
        response.error = error ? error : 'Message encryption failed';
    }
    return response;
}

const broadcastTransfer = async (payload) => {
    let response = { data: null, error: null }
    let { from, to, amount, memo, active_key } = payload;
    try {
        const transfer = await dhiveClient(default_node,60).broadcast.transfer({ from, to, amount, memo }, active_key)
        if (transfer) {
            response.data = transfer;
        } else {
            response.error = 'Broadcast transfer failed'
        }
    } catch (error) {
        response.error = error ? error.message : 'Broadcast transfer failed';
    }

    return response;
}

module.exports = {
    getAccount,
    getPrivateKeysFromLogin,
    getPrivateKeysFrom,
    testKey,
    setAmountAsset,
    encryptMessage,
    broadcastTransfer
}
