const { Router } = require('express')
const authRouter = Router()
const {
     authenticate,
     authPrivateKeys,
     userSessionCheck
} = require('./../controllers/auth');


authRouter.post('/', authenticate) 
authRouter.post('/private-keys', authPrivateKeys) 
authRouter.post('/session-check', userSessionCheck) 

module.exports = authRouter;