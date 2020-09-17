const { Router } = require('express')
const messageRouter = Router()
const {
     sendMessage,
     getAllTransfers,
     getAllTransfersToUser
} = require('./../controllers/message');

messageRouter.post('/send', sendMessage)
messageRouter.post('/transfers', getAllTransfers)
messageRouter.post('/transfers-to', getAllTransfersToUser)
module.exports = messageRouter;