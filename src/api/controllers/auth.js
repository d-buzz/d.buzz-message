const { utils, apiService } = require("./../../services");
const CONSTANTS = require("../../config/constants");
const globalStore = require("../../globals/store");
// authenticate using username & password
// params: username|string, password|string
const authenticate = async (req, res) => {
  try {
    const { username, password } = req.body;
    let active_key = "";
    let memo_key = "";
    let active_valid = false;
    let memo_valid = false;
    let keys_json = {};

    if (!username) {
      return res.json(
        utils.jsonResponse(
          null,
          CONSTANTS.USERNAME_NOT_FOUND,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }

    if (!password) {
      return res.json(
        utils.jsonResponse(
          null,
          CONSTANTS.PASSWORD_NOT_FOUND,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }

    // checks account if valid/exists
    let account = await apiService.getAccount(username);
    if (!account.data) {
      return res.json(
        utils.jsonResponse(
          null,
          CONSTANTS.ACCOUNT_INVALID,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }
    // checks posting key if valid/correct
    let getKeys = apiService.getPrivateKeysFromLogin(username, password);
    if (!getKeys.data) {
      return res.json(
        utils.jsonResponse(
          null,
          CONSTANTS.PASSWORD_INVALID,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }
    keys_json = getKeys.data;
    active_key = keys_json.active;
    memo_key = keys_json.memo;

    active_valid = apiService.testKey(active_key, account.data.active.key_auths)
      .data;
    memo_valid = apiService.testKey(memo_key, [[account.data.memo_key, 1]])
      .data;

    if (!active_valid && !memo_valid) {
      return res.json(
        utils.jsonResponse(
          null,
          CONSTANTS.PASSWORD_INVALID,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }

    const token = utils.generateJwt(username, password);
    globalStore.setUserOnlineStatus(username, 1)
    return res.json(utils.jsonResponse(token, CONSTANTS.AUTH_SUCCESS));
  } catch (error) {
    return res.json(
      utils.jsonResponse(
        error,
        CONSTANTS.AUTH_FAILED,
        CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
      )
    );
  }
};

const generateToken = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.json(
        utils.jsonResponse(
          null,
          CONSTANTS.USERNAME_NOT_FOUND,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }
    const token = utils.generateJwt(username);
    globalStore.setUserOnlineStatus(username, 1)
    return res.json(utils.jsonResponse(token, CONSTANTS.AUTH_SUCCESS));
  } catch (error) {
    return res.json(
      utils.jsonResponse(
        error,
        CONSTANTS.AUTH_FAILED,
        CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
      )
    );
  }
}

// authenticate using username & private keys (active and memo)
// params: username|string, active_key|string, memo_key|string
const authPrivateKeys = async (req, res) => {
  try {
    const { username, active_key, memo_key } = req.body;
    let active_valid = false;
    let memo_valid = false;
    if (!username) {
      return res.json(
        utils.jsonResponse(
          null,
          CONSTANTS.USERNAME_NOT_FOUND,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }

    if (!active_key) {
      return res.json(
        utils.jsonResponse(
          null,
          CONSTANTS.ACTIVEKEY_NOT_FOUND,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }

    if (!memo_key) {
      return res.json(
        utils.jsonResponse(
          null,
          CONSTANTS.MEMOKEY_NOT_FOUND,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }

    // checks account if valid/exists
    let account = await apiService.getAccount(username);
    if (!account.data) {
      return res.json(
        utils.jsonResponse(
          null,
          CONSTANTS.ACCOUNT_INVALID,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }

    active_valid = apiService.testKey(active_key, account.data.active.key_auths)
      .data;
    memo_valid = apiService.testKey(memo_key, [[account.data.memo_key, 1]])
      .data;

    if (!active_valid) {
      return res.json(
        utils.jsonResponse(
          null,
          CONSTANTS.ACTIVEKEY_INVALID,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }

    if (!memo_valid) {
      return res.json(
        utils.jsonResponse(
          null,
          CONSTANTS.MEMOKEY_INVALID,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }

    const keys = { active: active_key, memo: memo_key };
    return res.json(utils.jsonResponse(keys, CONSTANTS.AUTH_SUCCESS));
  } catch (error) {
    return res.json(
      utils.jsonResponse(
        error,
        CONSTANTS.AUTH_FAILED,
        CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
      )
    );
  }
};

module.exports = {
  authenticate,
  authPrivateKeys,
  generateToken
};
