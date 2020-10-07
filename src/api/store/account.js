const db = require("./../../db");

const _this = {
  // WRITE DATA
  setUsername: (username) => {
    db.set("username", username).write();
  },
  setCurrentNodeDB: (node) => {
    db.set("current_node", node).write();
  },
  setSetting: (key, value) => {
    let settings = _this.getSettings();
    settings[key] = value;
    db.set("settings", settings).write();
  },
  setAllSettings: (settings) => {
    db.set("settings", settings).write();
  },
  setBlackList : (blacklist) => {
    db.set('blacklist', blacklist).write()
  },
  updateAllSettings: (payload) => {
    let settings = _this.getSettings();
    Object.keys(payload).forEach((key) => {
      settings[key] = payload[key];
    });
  },
  addAccount: (account) => {
    const accounts = _this.getAccounts()
    if (accounts && accounts.length > 0) {
      state = accounts;
      const exists = accounts.filter((x) => x.name === account.name).length > 0;
      if (!exists) {
        state.push(account);
      }
    } else {
      state.push(account);
    }
    db.set("accounts", state).write();
  },

  // GET DATA
  getAccounts: () => {
    return db.get("accounts").value();
  },
  getSettings: () => {
    return db.get("settings").value();
  },
};

module.exports = _this;
