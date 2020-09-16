const { Router } = require('express')
const messageRouter = Router()
const {
     sendMessage,
     getMessages
} = require('./../controllers/message');

messageRouter.post('/send', sendMessage)
messageRouter.post('/history', getMessages)
module.exports = messageRouter;