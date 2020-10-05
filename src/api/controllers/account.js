const { utils, apiService } = require('./../services')

const getAccount = async (req, res) => {
    try {
        const { account } = req.params;
        if (!account) {
            return res.json(utils.jsonResponse(null, 'account is required', 400))
        }
        const account_info = await apiService.getAccount(account)
        if (!account_info.data) {
            return res.json(utils.jsonResponse(null, account_info.error, 400))
        }
        return res.json(utils.jsonResponse(account_info.data, 'Data fetched successfully'))
    } catch (error) {
        return res.json(utils.jsonResponse(error, 'No data fetched. Something went wrong...', 400))
    }
}

const getAccountContacts = async (req, res) => {
    try {
        const { account, memo_key } = req.body;
        if(!account){
            return res.json(utils.jsonResponse(null, 'account is required', 400))
        }
        if(!memo_key){
            return res.json(utils.jsonResponse(null, 'memo key is required', 400))
        }
    
        const transfers = await apiService.getTransfers(account,memo_key);
        if(!transfers.data){
            return res.json(utils.jsonResponse(null, transfers.error, 400))
        }
        const unique_users = [...new Set(transfers.data.map((item) => item.main_user))];
        return res.json(utils.jsonResponse(unique_users, 'Data fetched successfully'))
    } catch (error) {
        return res.json(utils.jsonResponse(error, 'No data fetched. Something went wrong...',400))
    }
}

module.exports = {
    getAccount,
    getAccountContacts
}