const lowdb = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const fs = require("fs");
const ENV = process.env;

const dir = () => {
  let path = ENV.APPDATA || `${ENV.HOME}/.local/share`;
  path = path + "/hivepm";
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
  if (!fs.existsSync(path + "/db")) {
    fs.mkdirSync(path + "/db");
  }
  return path + "/db/global.json";
};

const adapter = new FileSync(dir());
const db = lowdb(adapter);
db.defaults({
  username: "",
  accounts: [],
  settings: {
    default_currency: ENV.CURRENCY,
    use_encrypt: ENV.ENCRYPT_MSG,
    decrypt: true,
    default_amount: ENV.MIN_AMOUNT,
  },
  blacklist: [],
  current_node: ENV.NODE_DEFAULT,
  version: ENV.APP_VERSION,
}).write();

module.exports = db;
