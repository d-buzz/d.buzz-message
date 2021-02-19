const { Router } = require('express')
const messageRouter = Router()
const {
     sendMessage,
     getAllTransfers,
     getAllTransfersToUser,
     getTransfersGroupByMainUser
} = require('./../controllers/message');
const authGuard = require("../../middlewares/authGuard")

messageRouter.post('/send', authGuard, sendMessage)
messageRouter.post('/transfers', authGuard, getAllTransfers)
messageRouter.post('/transfers-to', authGuard, getAllTransfersToUser)
messageRouter.post('/transfers-group', authGuard, getTransfersGroupByMainUser)
module.exports = messageRouter;