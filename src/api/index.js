const express = require('express')
const api = express()
const { 
    authRouter,
    messageRouter,
    accountRouter
} = require('./routes')

api.use('/auth',authRouter)
api.use('/message',messageRouter)
api.use('/account',accountRouter)
module.exports = api