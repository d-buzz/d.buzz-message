const CONSTANTS = require("../config/constants");
const apiService = require("./api");
const utils = require("./utils")
const globalStore = require("../globals/store");

class Socket {
  constructor(socket) {
    this.io = socket;
    this.users = [];
  }
  socketConfig() {
    this.io.use(async (socket, next) => {
      try {
        if (socket.request._query["username"] !== undefined) {
          const username = socket.request._query["username"];
          const exists = await globalStore.checkUserExist(username)
          if (!exists) {
            globalStore.saveUser(username, { socketId: socket.id, online: 0 })
          } else {
            await globalStore.updateSocketId(username, socket.id)
          }

        }
        next();
      } catch (error) {
        console.error("error: ", error);
      }
    });

    this.socketEvents();
  }

  socketEvents() {
    this.io.on("connection", (socket) => {
      socket.on(`chat-list`, async (data) => {
        if (data.token === undefined || data.token == "") {
          this.io.emit(`chat-list-response`, {
            error: true,
            message: CONSTANTS.USER_NOT_FOUND,
          });
        } else {
          try {
            const token = data.token;
            const validateToken = utils.validateJwt(token);
            if (!validateToken) {
              this.io.emit(`chat-list-response`, {
                error: true,
                message: CONSTANTS.USER_NOT_FOUND,
              });
            } else {
              const account = validateToken.username;
              const token_hash = validateToken.hash;
              const useKeychain = validateToken.useKeychain;
              let memo_key = ""
              if (!useKeychain && token_hash) {
                const posting_key = utils.decryptPassword(token_hash);
                let getKeys = apiService.getPrivateKeysFromLogin(account, posting_key);
                if (getKeys.data) {
                  memo_key = getKeys.data.memo;
                }
              }
              await globalStore.setUserOnlineStatus(account, 1)
              let chatList = []
              let transfers = []
              const chatlistResponse = await apiService.getTransfers(account, memo_key);
              if (chatlistResponse.data && chatlistResponse.data.length > 0) {
                transfers = chatlistResponse.data;
                const unique_users = [
                  ...new Set(transfers.map((item) => item.main_user)),
                ];
                if (unique_users && unique_users.length > 0) {
                  unique_users.forEach((user) => {
                    let messages = transfers.filter((x) => x.main_user === user);
                    const lastNumber = Math.max.apply(Math, messages.map(function (o) { return o.number; }))
                    const lastChatDate = messages.filter((x) => x.number === lastNumber);
                    chatList.push({
                      username: user,
                      messages: utils.sortArrayObject(messages, "number", "asc"),
                      lastNumber,
                      lastDate: lastChatDate.length > 0 ? lastChatDate[0].time : ""
                    });
                  });
                }
              }
              const getOnlineStatuses = await globalStore.mapArrayOnlineStatus("username", chatList)
              await Promise.all([getOnlineStatuses])

              this.io.to(socket.id).emit(`chat-list-response`, {
                error: false,
                singleUser: false,
                chatList: chatList,
              });

              socket.broadcast.emit(`chat-list-response`, {
                error: false,
                singleUser: true,
                chatList: [
                  {
                    username: account,
                    online: await globalStore.getUserOnlineStatus(account),
                    messages: []
                  }
                ],
              });
            }
          } catch (error) {
            console.log(error);
            this.io.to(socket.id).emit(`chat-list-response`, {
              error: true,
              message: error.message
            });
          }
        }
      });

      /**
      * send the messages to the user
      */
      socket.on(`add-message`, async (data) => {
        if (data.message === undefined || data.message === '') {
          this.io.to(socket.id).emit(`add-message-response`, {
            error: true,
            message: CONSTANTS.MESSAGE_NOT_FOUND
          });
        } else if (data.from === undefined || data.from === '') {
          this.io.to(socket.id).emit(`add-message-response`, {
            error: true,
            message: CONSTANTS.SENDER_NOT_FOUND
          });
        } else if (data.to === undefined && data.to === '') {
          this.io.to(socket.id).emit(`add-message-response`, {
            error: true,
            message: CONSTANTS.RECEIVER_NOT_FOUND
          });
        } else {
          try {
            const toUser = await globalStore.checkUserExist(data.to)
            const toSocketId = toUser ? toUser.socketId : '';
            this.io.to(toSocketId).emit(`add-message-response`, data);
          } catch (error) {
            this.io.to(socket.id).emit(`add-message-response`, {
              error: true,
              message: CONSTANTS.MESSAGE_SEND_FAILED
            });
          }
        }
      });

      /**
       * Logout the user
       */
      socket.on("logout", async (data) => {
        try {
          const username = data.username;
          await globalStore.setUserOnlineStatus(username, 0)
          this.io.to(socket.id).emit(`logout-response`, {
            error: false,
            message: CONSTANTS.USER_LOGGED_OUT,
            username: username,
          });

          socket.broadcast.emit(`chat-list-response`, {
            error: false,
            userDisconnected: true,
            username: username,
          });
        } catch (error) {
          this.io.to(socket.id).emit(`logout-response`, {
            error: true,
            message: CONSTANTS.SERVER_ERROR_MESSAGE,
            username: username,
          });
        }
      });

      /**
       * sending the disconnected user to all socket users.
       */
      socket.on("disconnect", async () => {
        const username = socket.request._query["username"]
        await globalStore.setUserOnlineStatus(username, 0)
        socket.broadcast.emit(`chat-list-response`, {
          error: false,
          userDisconnected: true,
          username: username,
        });
      });
    });
  }
}

module.exports = Socket;
