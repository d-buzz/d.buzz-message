let _store = {
  users: [],
  setUsers: (values) => {
    _store.users = values;
  },
  getUsers: () => {
    return _store.users;
  },
  getUserIndex: (key, value) => {
    const users = _store.users;
    let index = -1;
    if (users && users.length > 0) {
      index = users.map((x) => x[key]).indexOf(value);
    }
    return index;
  },
  getUserByUsername: (username) => {
    const index = _store.getUserIndex("username", username);
    let data = "";
    if (index > -1) {
      data = _store.users[index];
    }
    return data;
  },
  getUserBySocketId: (socketId) => {
    const index = _store.getUserIndex("socketId", socketId);
    let data = "";
    if (index > -1) {
      data = _store.users[index];
    }
    return data;
  },
  getUserOnlineStatus: (username) => {
    const user = _store.getUserByUsername(username);
    let isOnline = 0;
    if (user) {
      isOnline = user.isOnline !== undefined ? user.isOnline : 0;
    }
    return isOnline;
  },
  setUserOnlineStatus: (username, status) => {
    const index = _store.getUserIndex("username", username);
    if (index > -1) {
      _store.users[index].isOnline = status;
    }
  },
  setUserSocketId: (username, socketId) => {
    const index = _store.getUserIndex("username", username);
    if (index > -1) {
      _store.users[index].socketId = socketId;
    }
  },
  setUserChats: (username, chatList) => {
    const index = _store.getUserIndex("username", username);
    if (index > -1) {
      if (chatList && chatList.length > 0) {
        _store.users[index].chatList = chatList;
      }
    }
  },
  setUserTransfers: (username, transfers) => {
    const index = _store.getUserIndex("username", username);
    if (index > -1) {
      if (transfers && transfers.length > 0) {
        _store.users[index].transfers = transfers;
      }
    }
  },
  clearUserChats: (username) => {
    const index = _store.getUserIndex("username", username);
    if (index > -1) {
      _store.users[index].chatList = [];
    }
  },
  pushNewMessage: (username, chatUsername, messageObj) => {
    const index = _store.getUserIndex("username", username);
    if (index > -1) {
      const userObj = _store.users[index];
      const chatList = userObj.chatList;
      if (chatList !== undefined && chatList.length > 0) {
        const msgIndex = userObj.chatList
          .map((x) => x.username)
          .indexOf(chatUsername);
        if (
          msgIndex !== -1 &&
          userObj.chatList[msgIndex].messages !== undefined &&
          userObj.chatList[msgIndex].messages.length > 0
        ) {
          userObj.chatList[msgIndex].messages.push(messageObj);
        } else {
          userObj.chatList.push({
            username: chatUsername,
            messages: [messageObj],
            online: 1
          })
        }
      }
    }
  },
};

module.exports = _store;
