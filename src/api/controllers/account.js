const { utils, apiService } = require("./../../services");
const globalStore = require("../../globals/store");
const CONSTANTS = require("../../config/constants");

// get specific hive account metadata
const getAccount = async (req, res) => {
  try {
    const { account } = req.params;
    if (!account) {
      return res.json(
        utils.jsonResponse(null, CONSTANTS.ACCOUNT_NOT_FOUND, 400)
      );
    }
    const account_info = await apiService.getAccount(account);
    if (!account_info.data) {
      return res.json(
        utils.jsonResponse(
          null,
          account_info.error,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }
    return res.json(
      utils.jsonResponse(account_info.data, CONSTANTS.DATA_FETCH_OK)
    );
  } catch (error) {
    return res.json(
      utils.jsonResponse(
        error,
        CONSTANTS.DATA_FETCH_FAILED,
        CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
      )
    );
  }
};

// get account contacts with message/transfer history
const getAccountContacts = async (req, res) => {
  try {
    const { account } = req.body;
    if (!account) {
      return res.json(
        utils.jsonResponse(
          null,
          CONSTANTS.ACCOUNT_NOT_FOUND,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }

    const transfers = await apiService.getTransfers(account);
    if (!transfers.data) {
      return res.json(
        utils.jsonResponse(
          null,
          transfers.error,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }
    const unique_users = [
      ...new Set(transfers.data.map((item) => item.main_user)),
    ];
    let chatList = [];
    if (unique_users.length > 0) {
      unique_users.forEach((user) => {
        chatList.push({
          username: user,
        });
      });
    }

    const getOnlineStatuses = await globalStore.mapArrayOnlineStatus("username", chatList)
    await Promise.all([getOnlineStatuses])
    return res.json(utils.jsonResponse(chatList, CONSTANTS.DATA_FETCH_OK));
  } catch (error) {
    return res.json(
      utils.jsonResponse(
        error,
        CONSTANTS.DATA_FETCH_FAILED,
        CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
      )
    );
  }
};

// search hive accounts
const searchAccounts = async (req, res) => {
  try {
    const { account, limit = 10 } = req.params;
    if (!account) {
      return res.json(
        utils.jsonResponse(
          null,
          CONSTANTS.ACCOUNT_NOT_FOUND,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }

    const accounts = await apiService.lookupAccounts(account, limit)
    if (!accounts.data) {
      return res.json(
        utils.jsonResponse(
          null,
          accounts.error,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }
    return res.json(utils.jsonResponse(accounts.data, CONSTANTS.DATA_FETCH_OK));
  } catch (error) {
    return res.json(
      utils.jsonResponse(
        error,
        CONSTANTS.DATA_FETCH_FAILED,
        CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
      )
    );
  }
}

// get specific account online status
const getAccountOnlineStatus = async (req, res) => {
  try {
    const { account } = req.params
    if (!account) {
      return res.json(
        utils.jsonResponse(
          null,
          CONSTANTS.ACCOUNT_NOT_FOUND,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }

    const online = await globalStore.getUserOnlineStatus(account);
    const response = {
      username: account,
      online
    }

    return res.json(utils.jsonResponse(response, CONSTANTS.DATA_FETCH_OK));
  } catch (error) {
    return res.json(
      utils.jsonResponse(
        error,
        CONSTANTS.DATA_FETCH_FAILED,
        CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
      )
    );
  }
}

module.exports = {
  getAccount,
  getAccountContacts,
  searchAccounts,
  getAccountOnlineStatus
};
