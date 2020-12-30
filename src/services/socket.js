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
          const exists =
            this.users.filter((x) => x.username === username).length > 0;
          if (!exists) {
            this.users.push({
              username: username,
              socketId: socket.id,
            });
            globalStore.setUsers(this.users);
          }else{
            globalStore.setUserSocketId(username,socket.id)
          }
        }
        console.log("users: ", globalStore.getUsers());
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
            if (!validateToken && !validateToken.hash) {
                this.io.emit(`chat-list-response`, {
                  error: true,
                  message: CONSTANTS.USER_NOT_FOUND,
                });
            }else{
              const account = validateToken.username;
              const token_hash = validateToken.hash;
              const posting_key = utils.decryptPassword(token_hash);
              let getKeys = apiService.getPrivateKeysFromLogin(account, posting_key);
              if (!getKeys.data) {
                this.io.emit(`chat-list-response`, {
                  error: true,
                  message: CONSTANTS.USER_NOT_FOUND,
                });
              }else{
                globalStore.setUserOnlineStatus(account,1)
                const memo_key = getKeys.data.memo;
                let chatList = []

                const getUser = globalStore.getUserByUsername(account);
                if(getUser.chatList !== undefined && getUser.chatList.length > 0){
                  chatList = getUser.chatList;
                  chatList.map((chat) => {
                    chat.online = globalStore.getUserOnlineStatus(chat.username);
                    return chat;
                  })
                }else{
                  const chatlistResponse = await apiService.getTransfersGroupByMainUser(account,memo_key);
                  if (chatlistResponse.data && chatlistResponse.data.length > 0) {
                    chatList = chatlistResponse.data;
                    globalStore.setUserChats(account, chatList);
                  }
                }
                this.io.to(socket.id).emit(`chat-list-response`, {
                  error: false,
                  singleUser: false,
                  chatList: chatList,
                });

                socket.broadcast.emit(`chat-list-response`, {
                  error: false,
                  singleUser: true,
                  chatList: [
                    { username: account, 
                      online: globalStore.getUserOnlineStatus(account),
                      messages: []
                    }  
                  ],
                });
              }
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
				if (data.message === '') {
					this.io.to(socket.id).emit(`add-message-response`,{
						error : true,
						message: CONSTANTS.MESSAGE_NOT_FOUND
					}); 
				}else if(data.from === ''){
					this.io.to(socket.id).emit(`add-message-response`,{
						error : true,
						message: CONSTANTS.SENDER_NOT_FOUND
					}); 
				}else if(data.to === ''){
					this.io.to(socket.id).emit(`add-message-response`,{
						error : true,
						message: CONSTANTS.RECEIVER_NOT_FOUND
					}); 
				}else{
					try {
            const toUser = globalStore.getUserByUsername(data.to)
            const toSocketId = toUser ? toUser.socketId : '';
						this.io.to(toSocketId).emit(`add-message-response`,data); 
					} catch (error) {
						this.io.to(socket.id).emit(`add-message-response`,{
							error : true,
							message : CONSTANTS.MESSAGE_SEND_FAILED
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
          globalStore.setUserOnlineStatus(username,0)
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
        socket.broadcast.emit(`chat-list-response`, {
          error: false,
          userDisconnected: true,
          username: socket.request._query["username"],
        });
      });
    });
  }
}

module.exports = Socket;
