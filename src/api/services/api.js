const utils = require('./utils')
const config = require('./../../config')
const hive = require('@hiveio/hive-js');
const nodes = [
    "https://api.hive.blog", 
    "https://api.hivekings.com",
    "https://anyx.io", 
    "https://api.openhive.network"
]
const default_node = config.NODE_DEFAULT || nodes[0]; 
const dhiveClient = utils.dhiveClientConnect(default_node)

const getAccount = async (account) => {
    let response = { data: null, error: null }
    try {
        const acc = await dhiveClient.database.getAccounts([account])
        if (acc && acc[0]) {
            response.data = acc[0];
        } else {
            response.error = 'No data fetched';
        }
    } catch (error) {
        response.error = error;
    }
    return response;
}

const getPrivateKeys = (account, password) => {
    let response = { data: null, error: null }
    let keys = { active: '', memo: '' }
    try {
        keys.active = utils.getPrivateKeys(account,password,'active');
        keys.memo = utils.getPrivateKeys(account,password,'memo');  
        response.data = keys;
    } catch (error) {
        response.error = error;
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

module.exports = {
    getAccount,
    getPrivateKeys,
    testKey
}
