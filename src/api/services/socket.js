const CONSTANTS = require("../config/constants");
const apiService = require("./api");
const globalStore = require("./../globals/store");

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
        if (data.username == "") {
          this.io.emit(`chat-list-response`, {
            error: true,
            message: CONSTANTS.USER_NOT_FOUND,
          });
        } else {
          try {
            let chatList = [];
            const userInfoResponse = globalStore.getUserByUsername(
              data.username
            );
            if (
              userInfoResponse.chatList !== undefined &&
              userInfoResponse.chatList.length > 0
            ) {
              chatList = userInfoResponse.chatList;
            } else {
              const chatlistResponse = await apiService.getTransfers(
                data.username
              );
              if (chatlistResponse.data && chatlistResponse.data.length > 0) {
                const unique_users = [
                  ...new Set(
                    chatlistResponse.data.map((item) => item.main_user)
                  ),
                ];
                if (unique_users.length > 0) {
                  unique_users.forEach((user) => {
                    chatList.push({
                      username: user,
                      online:
                        globalStore.getUserOnlineStatus(user) == 0 ? "N" : "Y",
                    });
                  });
                  globalStore.setUserContacts(data.username, chatList);
                }
              }
            }

            console.log("new list", globalStore.getUsers());
            this.io.to(socket.id).emit(`chat-list-response`, {
              error: false,
              singleUser: false,
              chatList: chatList,
            });
            socket.broadcast.emit(`chat-list-response`, {
              error: false,
              singleUser: true,
              chatList: userInfoResponse,
            });
          } catch (error) {
            console.log(error);
            this.io.to(socket.id).emit(`chat-list-response`, {
              error: true,
              chatList: [],
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
          console.log(error);
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
