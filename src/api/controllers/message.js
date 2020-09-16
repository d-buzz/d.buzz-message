const config = require('./../../config');
const { utils, apiService } = require('./../services')

// Sends message (encrypted or not)
// params: message, active_key, memo_key, account_from, account_to, use_encrypt
const sendMessage = async (req, res) => {
    try {
        const {
            message,
            active_key,
            memo_key,       // required if use_encrypt is true
            account_from,   // message sender
            account_to,     // message receiver
            use_encrypt,    // 1 or 0; default in config.ENCRYPT_MSG
            amount,
            currency
        } = req.body

        const asset = currency ? currency : config.CURRENCY;
        const useEncrypt = use_encrypt ? parseInt(use_encrypt) == 1 : config.ENCRYPT_MSG;
        if (useEncrypt && !memo_key) {
            return res.json(utils.jsonResponse(null, 'memo key is required', 400))
        }

        if (!active_key) {
            return res.json(utils.jsonResponse(null, 'active key is required', 400))
        }

        if (!message) {
            return res.json(utils.jsonResponse(null, 'message is required', 400))
        }

        if (!amount || parseFloat(amount) <= 0) {
            return res.json(utils.jsonResponse(null, 'amount is required', 400))
        }

        if (parseFloat(config.MIN_AMOUNT) > parseFloat(amount)) {
            return res.json(utils.jsonResponse(null, `minimum amount is ${config.MIN_AMOUNT} ${config.CURRENCY}`, 400))
        }

        if (!utils.validateCurrency(asset)) {
            return res.json(utils.jsonResponse(null, 'invalid currency', 400))
        }

        if (!account_from) {
            return res.json(utils.jsonResponse(null, 'sender username is required', 400))
        }

        if (!account_to) {
            return res.json(utils.jsonResponse(null, 'receiver username is required', 400))
        }

        let account = await apiService.getAccount(account_to);
        if (!account.data) {
            return res.json(utils.jsonResponse(null, 'invalid receiver account', 400))
        }

        let memo = message;
        if (useEncrypt) { // encrypt message
            const encoded_msg = apiService.encryptMessage(memo_key, account.data.memo_key, message);
            if (!encoded_msg.data) {
                return res.json(utils.jsonResponse(null, encoded_msg, 400))
            }
            memo = encoded_msg.data;
        }

        const amount_asset = apiService.setAmountAsset(amount, asset);
        if(!amount_asset.data){
            return res.json(utils.jsonResponse(null, amount_asset.error, 400))
        }

        const privatekey_from = apiService.getPrivateKeysFrom(active_key);
        if(!privatekey_from.data){
            return res.json(utils.jsonResponse(null, privatekey_from.error, 400))
        }

        const params = {
            from: account_from,
            to: account_to,
            amount: amount_asset.data,
            memo: memo,
            active_key: privatekey_from.data
        }

        const transfer = await apiService.broadcastTransfer(params);
        if(!transfer.data){
            return res.json(utils.jsonResponse(null, transfer.error, 400))
        }
        return res.json(utils.jsonResponse(transfer.data, 'Message successfully sent'))
    } catch (error) {
        return res.json(utils.jsonResponse(error, 'Message sending failed. Something went wrong...',400))
    }
}
// TODO: getMessages logic
const getMessages = (req, res) => {
    return res.json(utils.jsonResponse(null, 'Get messages here...'))
}

module.exports = {
    sendMessage,
    getMessages
}

