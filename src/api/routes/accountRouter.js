const { Router } = require('express')
const accountRouter = Router()
const {
     getAccount,
     getAccountContacts,
     searchAccounts,
     getAccountOnlineStatus
} = require('./../controllers/account');


accountRouter.get('/@:account', getAccount)
accountRouter.post('/contacts', getAccountContacts)
accountRouter.get('/search/@:account/:limit', searchAccounts)
accountRouter.get('/is-online/@:account', getAccountOnlineStatus)
module.exports = accountRouter;