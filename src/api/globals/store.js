let _store = {
  users: [],
  setUsers: (values) => {
    _store.users = values;
  },
  getUsers: () => {
    return _store.users;
  },
  getUserIndex: (username) => {
    const users = _store.users;
    let index = -1;
    if (users && users.length > 0) {
      index = users.map((x) => x.username).indexOf(username);
    }
    return index;
  },
  getUserByUsername: (username) => {
    const index = _store.getUserIndex(username);
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
    const index = _store.getUserIndex(username);
    if (index > -1) {
      _store.users[index].isOnline = status;
    }
  },
  setUserChats: (username, chatList) => {
    const index = _store.getUserIndex(username);
    if (index > -1) {
      if (chatList && chatList.length > 0) {
        _store.users[index].chatList = chatList;
      }
    }
  },
};

module.exports = _store;
