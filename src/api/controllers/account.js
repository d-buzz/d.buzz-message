const { utils, apiService } = require("./../../services");
const globalStore = require("../../globals/store");
const CONSTANTS = require("../../config/constants");

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
          online: globalStore.getUserOnlineStatus(user),
        });
      });
    }
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

module.exports = {
  getAccount,
  getAccountContacts,
};
