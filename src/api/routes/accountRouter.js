const { Router } = require('express')
const accountRouter = Router()
const {
     getAccount,
     getAccountContacts,
     searchAccounts
} = require('./../controllers/account');


accountRouter.get('/@:account', getAccount)
accountRouter.post('/contacts', getAccountContacts)
accountRouter.get('/search/@:account/:limit', searchAccounts)
module.exports = accountRouter;