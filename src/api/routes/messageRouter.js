const { Router } = require('express')
const messageRouter = Router()
const {
     sendMessage,
     getMessages
} = require('./../controllers/message');

messageRouter.post('/send', sendMessage)
messageRouter.post('/list', getMessages)
module.exports = messageRouter;