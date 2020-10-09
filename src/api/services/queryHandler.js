const Mongodb = require("../config/database");
const CONSTANTS = require("../config/constants")
const _usercol = CONSTANTS.USERS_DOC_NAME;
const _messagecol = CONSTANTS.MESSAGES_DOC_NAME;

const _this = {
  usernameCheck: (data) => {
    return new Promise(async (resolve, reject) => {
      try {
        const [DB, client] = await Mongodb.onConnect();
        DB.collection(_usercol)
          .find(data)
          .count((error, result) => {
            client.close();
            if (error) {
              reject(error);
            }
            resolve(result);
          });
      } catch (error) {
        reject(error);
      }
    });
  },
  saveUser: (data) => {
    return new Promise(async (resolve, reject) => {
      try {
        const [DB, client] = await Mongodb.onConnect();
        DB.collection(_usercol).insertOne(data, (err, result) => {
          client.close();
          if (err) {
            reject(err);
          }
          resolve(result);
        });
      } catch (error) {
        reject(error);
      }
    });
  },
  getUser: (data) => {
    return new Promise(async (resolve, reject) => {
      try {
        const [DB, client] = await Mongodb.onConnect();
        DB.collection(_usercol)
          .find(data)
          .toArray((error, result) => {
            client.close();
            if (error) {
              reject(error);
            }
            resolve(result[0]);
          });
      } catch (error) {
        reject(error);
      }
    });
  },
  updateUser: (condition, data) => {
    return new Promise(async (resolve, reject) => {
      try {
        const [DB, client] = await Mongodb.onConnect();
        DB.collection(_usercol).updateOne(condition, data, (err, result) => {
          client.close();
          if (err) {
            reject(err);
          }
          resolve(result);
        });
      } catch (error) {
        reject(error);
      }
    });
  },
  setUserOnlineStatus: (userId, online = 0) => {
    return new Promise(async (resolve, reject) => {
      try {
        const [DB, client, ObjectId] = await Mongodb.onConnect();
        DB.collection(_usercol).updateOne(
          { _id: ObjectId(userId) },
          { $set: { online } },
          (err, result) => {
            client.close();
            if (err) {
              reject(err);
              console.log(err);
            }
            resolve(result);
          }
        );
      } catch (error) {
        reject(error);
        console.log(error);
      }
    });
  },
  userSessionCheck: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const [DB, client, ObjectId] = await Mongodb.onConnect();
        DB.collection(_usercol).findOne(
          { _id: ObjectId(userId), online: 1 },
          (err, result) => {
            client.close();
            if (err) {
              reject(err);
            }
            resolve(result);
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  },

  saveMessage: (data) => {
    return new Promise(async (resolve, reject) => {
      try {
        const [DB, client] = await Mongodb.onConnect();
        DB.collection(_messagecol).insertOne(data, (err, result) => {
          client.close();
          if (err) {
            reject(err);
          }
          resolve(result);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
};

module.exports = _this;
