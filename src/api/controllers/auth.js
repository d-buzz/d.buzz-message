const { utils, apiService } = require('./../services')

// authenticate using username & password
// params: username|string, password|string
const authenticate = async (req, res) => {
    try {
        const { username, password } = req.body;
        let active_key = memo_key = '';
        let active_valid = memo_valid = false;

        if (!username) {
            return res.json(utils.jsonResponse(null, 'username is required', 400))
        }

        if (!password) {
            return res.json(utils.jsonResponse(null, 'password is required', 400))
        }

        // checks account if valid/exists
        let account = await apiService.getAccount(username);
        if (!account.data) {
            return res.json(utils.jsonResponse(null, 'invalid account', 400))
        }

        // checks posting key if valid/correct
        let getKeys = apiService.getPrivateKeysFromLogin(username, password);
        if (!getKeys.data) {
            return res.json(utils.jsonResponse(null, 'invalid password', 400))
        }

        active_key = getKeys.data.active;
        memo_key = getKeys.data.memo;
        active_valid = apiService.testKey(active_key, account.data.active.key_auths).data
        memo_valid = apiService.testKey(memo_key, [[account.data.memo_key, 1]]).data

        if (!active_valid && !memo_valid) {
            return res.json(utils.jsonResponse(null, 'invalid password', 400))
        }
        return res.json(utils.jsonResponse(getKeys.data, 'Authenticated successfully'))
    } catch (error) {
        return res.json(utils.jsonResponse(error, 'Authentication failed. Something went wrong...', 400))
    }
}

// authenticate using username & private keys (active and memo)
// params: username|string, active_key|string, memo_key|string
const authPrivateKeys = async (req, res) => {
    try {
        const { username, active_key, memo_key } = req.body;
        let active_valid = memo_valid = false;

        if (!username) {
            return res.json(utils.jsonResponse(null, 'username is required', 400))
        }

        if (!active_key) {
            return res.json(utils.jsonResponse(null, 'active key is required', 400))
        }

        if (!memo_key) {
            return res.json(utils.jsonResponse(null, 'memo key is required', 400))
        }

        // checks account if valid/exists
        let account = await apiService.getAccount(username);
        if (!account.data) {
            return res.json(utils.jsonResponse(null, 'invalid account', 400))
        }

        active_valid = apiService.testKey(active_key, account.data.active.key_auths).data
        memo_valid = apiService.testKey(memo_key, [[account.data.memo_key, 1]]).data

        if (!active_valid) {
            return res.json(utils.jsonResponse(null, 'invalid active key', 400))
        }

        if (!memo_valid) {
            return res.json(utils.jsonResponse(null, 'invalid memo key', 400))
        }

        const keys = { active: active_key, memo: memo_key };
        return res.json(utils.jsonResponse(keys, 'Authenticated successfully'))
    } catch (error) {
        return res.json(utils.jsonResponse(error, 'Authentication failed. Something went wrong...', 400))
    }
}

module.exports = {
    authenticate,
    authPrivateKeys
}