const { Router } = require('express')
const messageRouter = Router()
const {
     sendMessage,
     getAllTransfers,
     getAllTransfersToUser
} = require('./../controllers/message');
const authGuard = require("../../middlewares/authGuard")

messageRouter.post('/send', authGuard, sendMessage)
messageRouter.post('/transfers', authGuard, getAllTransfers)
messageRouter.post('/transfers-to', authGuard, getAllTransfersToUser)
module.exports = messageRouter;