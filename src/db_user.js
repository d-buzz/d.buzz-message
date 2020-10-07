const lowdb = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const fs = require("fs");
const ENV = process.env;

const dir = (name) => {
  let path = ENV.APPDATA || `${ENV.HOME}/.local/share`;
  path = path + "/hivepm";
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
  if (!fs.existsSync(path + "/db/users")) {
    fs.mkdirSync(path + "/db/users");
  }
  return `${path}/db/users/${name}.json`;
};

const db_user = (name) => {
  let adapter = new FileSync(dir(name));
  let db = lowdb(adapter);
  db.defaults({
    name,
    last_transfer_num: 0,
    memo_key: "",
    active_key: "",
    transfers: [],
    hidelist: [],
    global_last_transfer: 0,
    notifications: [],
  }).write();
  return db;
};

module.exports = db_user;
