const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectID;
const assert = require("assert");
const config = require("./appConfig");
const dbUrl = config.DB_URL;
const dbName = config.DB_NAME;

const _this = {
  onConnect: () => {
    return new Promise((resolve, reject) => {
      try {
        const client = new MongoClient(dbUrl, { useUnifiedTopology: true });
        client.connect(function (err) {
          if (err) {
            reject(err);
          } else {
            assert.strictEqual(null, err);
            const db = client.db(dbName);
            resolve([db, client, ObjectId]);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = _this;
