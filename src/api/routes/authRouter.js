const { Router } = require('express')
const authRouter = Router()
const {
     authenticate,
     authPrivateKeys,
     generateToken
} = require('./../controllers/auth');

authRouter.post('/', authenticate)
authRouter.post('/generate-token', generateToken)
authRouter.post('/private-keys', authPrivateKeys)

module.exports = authRouter;
