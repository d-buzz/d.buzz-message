const utils = require("./utils");
const api = require("./api");
const socket = require("./socket");

module.exports = {
  utils: utils,
  apiService: api,
  socketEvents: socket,
};
