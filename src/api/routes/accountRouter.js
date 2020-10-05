const { Router } = require('express')
const accountRouter = Router()
const {
     getAccount,
     getAccountContacts
} = require('./../controllers/account');


accountRouter.get('/@:account', getAccount) 
accountRouter.post('/contacts', getAccountContacts) 
module.exports = accountRouter;