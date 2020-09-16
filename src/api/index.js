const express = require('express')
const api = express()
const { 
    authRouter,
    messageRouter
} = require('./routes')

api.use('/auth',authRouter)
api.use('/message',messageRouter)
module.exports = api