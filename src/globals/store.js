const redis = require("./../config/redisConnect")
let _store = {
  getRedisByKey: (key) => {
    return new Promise((resolve, reject) => {
      redis.get(key, (err, data) => {
        if (err) {
          reject(err)
          return
        }

        if (data === null) {
          resolve(null)
          return
        }

        try {
          resolve(
            JSON.parse(data)
          )
        } catch (ex) {
          resolve(data)
        }
      })
    })
  },

  // check if key username exists
  checkUserExist: async (username) => {
    return await _store.getRedisByKey(username);
  },

  // save new user
  saveUser: (username, objVal) => {
    redis.set(username, JSON.stringify(objVal));
  },

  //update user socket ID
  updateSocketId: async (username, socketId) => {
    const user = await _store.getRedisByKey(username);
    if (user) {
      user.socketId = socketId
      redis.set(username, JSON.stringify(user));
    }
  },

  // update user online status
  setUserOnlineStatus: async (username, status) => {
    const user = await _store.getRedisByKey(username);
    if (user) {
      user.online = status
      redis.set(username, JSON.stringify(user));
    }
  },

  // get user online status
  getUserOnlineStatus: async (username) => {
    const user = await _store.getRedisByKey(username)
    return user && user.online !== undefined ? user.online : 0;
  },

  // map user array online status
  mapArrayOnlineStatus: (user_key = "username", array) => {
    return new Promise((resolve, reject) => {
      let count = 0;
      try {
        if (array.length > 0) {
          array.forEach(async (chat) => {
            chat.online = await _store.getUserOnlineStatus(chat[user_key]);
            count++;
            if (count === array.length) {
              resolve(true)
            }
          })
        } else {
          resolve(null)
        }
      } catch (error) {
        reject(error)
      }
    });
  },
};

module.exports = _store;
