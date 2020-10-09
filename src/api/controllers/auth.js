const { utils, apiService, queryHandler } = require("./../services");
const CONSTANTS = require("./../config/constants");
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
    let user_id = "";

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

    const checkUserExist = await queryHandler.getUser({ username });
    if (!checkUserExist) {
      const saveUser = await queryHandler.saveUser({
        username,
        active_key,
        memo_key,
        online: 1,
      });
      if (!saveUser) {
        return res.json(
          utils.jsonResponse(
            null,
            CONSTANTS.AUTH_FAILED,
            CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
          )
        );
      }
      user_id = saveUser.ops[0]._id;
    } else {
      user_id = checkUserExist._id;
      const updateUser = await queryHandler.setUserOnlineStatus(user_id, 1);
      if (!updateUser) {
        return res.json(
          utils.jsonResponse(
            null,
            CONSTANTS.AUTH_FAILED,
            CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
          )
        );
      }
    }
    keys_json.user_id = user_id;
    return res.json(
      utils.jsonResponse(keys_json, CONSTANTS.AUTH_SUCCESS)
    );
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

// authenticate using username & private keys (active and memo)
// params: username|string, active_key|string, memo_key|string
const authPrivateKeys = async (req, res) => {
  try {
    const { username, active_key, memo_key } = req.body;
    let active_valid = false;
    let memo_valid = false;
    let user_id = "";
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

    const getUserFromDB = await queryHandler.getUser({
      username,
      active_key,
      memo_key,
    });
    if (!getUserFromDB) {
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

      active_valid = apiService.testKey(
        active_key,
        account.data.active.key_auths
      ).data;
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

      const checkUserExist = await queryHandler.usernameCheck({ username });
      if (!checkUserExist) {
        const saveUser = await queryHandler.saveUser({
          username,
          active_key,
          memo_key,
          online: 1,
        });
        if (!saveUser) {
          return res.json(
            utils.jsonResponse(
              null,
              CONSTANTS.AUTH_FAILED,
              CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
            )
          );
        }
        user_id = saveUser.ops[0]._id;
      }
    } else {
      user_id = getUserFromDB._id;
      const updateUser = await queryHandler.setUserOnlineStatus(user_id, 1);
      if (!updateUser) {
        return res.json(
          utils.jsonResponse(
            null,
            CONSTANTS.AUTH_FAILED,
            CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
          )
        );
      }
    }

    const keys = { active: active_key, memo: memo_key, user_id };
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

// checks user session if logged in
// params: user_id|string
const userSessionCheck = async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      return res.json(
        utils.jsonResponse(
          null,
          CONSTANTS.USERID_NOT_FOUND,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }
    const checkSession = await queryHandler.userSessionCheck(user_id);
    if (!checkSession) {
      return res.json(
        utils.jsonResponse(
          null,
          CONSTANTS.LOGIN_FAILED,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }
    return res.json(utils.jsonResponse(checkSession, CONSTANTS.LOGIN_OK));
  } catch (error) {
    return res.json(
      utils.jsonResponse(
        error,
        CONSTANTS.LOGIN_FAILED,
        CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
      )
    );
  }
};

module.exports = {
  authenticate,
  authPrivateKeys,
  userSessionCheck,
};
