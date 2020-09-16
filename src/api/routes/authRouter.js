const { Router } = require('express')
const authRouter = Router()
const {
     authenticate,
     authPrivateKeys
} = require('./../controllers/auth');


authRouter.post('/', authenticate) 
authRouter.post('/private-keys', authPrivateKeys) 

module.exports = authRouter;