const config = require("../config/appConfig");
const CONSTANTS = require("../config/constants");
const { utils, apiService } = require("./../services");
// Sends message (encrypted or not)
// params: message|string, account_from|string,
// params: account_to|string, use_encrypt|number, amount|float, currency|string
const sendMessage = async (req, res) => {
  try {
    const {
      hash, // from token
      message,
      account_from, // message sender
      account_to, // message receiver
      use_encrypt, // 1 or 0; default in config.ENCRYPT_MSG
      amount,
      currency,
    } = req.body;

    const asset = currency ? currency : config.CURRENCY;

    const posting_key = utils.decryptPassword(hash);
    let getKeys = apiService.getPrivateKeysFromLogin(account_from, posting_key);
    if (!getKeys.data) {
      return res.json(
        utils.jsonResponse(
          null,
          CONSTANTS.PASSWORD_INVALID,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }

    const memo_key = getKeys.data.memo;
    const active_key = getKeys.data.active;
    const useEncrypt = use_encrypt
      ? parseInt(use_encrypt) == 1
      : config.ENCRYPT_MSG;
    if (useEncrypt && !memo_key) {
      return res.json(
        utils.jsonResponse(
          null,
          CONSTANTS.MEMOKEY_NOT_FOUND,
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

    if (!message) {
      return res.json(
        utils.jsonResponse(
          null,
          CONSTANTS.MESSAGE_NOT_FOUND,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }

    if (!amount || parseFloat(amount) <= 0) {
      return res.json(
        utils.jsonResponse(
          null,
          CONSTANTS.AMOUNT_NOT_FOUND,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }

    if (parseFloat(config.MIN_AMOUNT) > parseFloat(amount)) {
      return res.json(
        utils.jsonResponse(
          null,
          `minimum amount is ${config.MIN_AMOUNT} ${config.CURRENCY}`,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }

    if (!utils.validateCurrency(asset)) {
      return res.json(
        utils.jsonResponse(
          null,
          CONSTANTS.CURRENCY_INVALID,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }

    if (!account_from) {
      return res.json(
        utils.jsonResponse(
          null,
          CONSTANTS.SENDER_NOT_FOUND,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }

    if (!account_to) {
      return res.json(
        utils.jsonResponse(
          null,
          CONSTANTS.RECEIVER_NOT_FOUND,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }

    let account = await apiService.getAccount(account_to);
    if (!account.data) {
      return res.json(
        utils.jsonResponse(
          null,
          CONSTANTS.RECEIVER_INVALID,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }

    let memo = message;
    if (useEncrypt) {
      // encrypt message
      const encoded_msg = apiService.encryptMessage(
        memo_key,
        account.data.memo_key,
        message
      );
      if (!encoded_msg.data) {
        return res.json(
          utils.jsonResponse(
            null,
            encoded_msg,
            CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
          )
        );
      }
      memo = encoded_msg.data;
    }

    const amount_asset = apiService.setAmountAsset(amount, asset);
    if (!amount_asset.data) {
      return res.json(
        utils.jsonResponse(
          null,
          amount_asset.error,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }

    const privatekey_from = apiService.getPrivateKeysFrom(active_key);
    if (!privatekey_from.data) {
      return res.json(
        utils.jsonResponse(
          null,
          privatekey_from.error,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }

    const params = {
      from: account_from,
      to: account_to,
      amount: amount_asset.data,
      memo: memo,
      active_key: privatekey_from.data,
    };

    const transfer = await apiService.broadcastTransfer(params);
    if (!transfer.data) {
      return res.json(
        utils.jsonResponse(
          null,
          transfer.error,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }
    return res.json(
      utils.jsonResponse(transfer.data, CONSTANTS.MESSAGE_SEND_OK)
    );
  } catch (error) {
    return res.json(
      utils.jsonResponse(
        error.message,
        CONSTANTS.MESSAGE_SEND_FAILED,
        CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
      )
    );
  }
};

// Gets all transfer transactions of specific account
// params: account|string
const getAllTransfers = async (req, res) => {
  try {
    const { account, hash } = req.body;

    if (!account) {
      return res.json(
        utils.jsonResponse(
          null,
          CONSTANTS.ACCOUNT_NOT_FOUND,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }
    
    const posting_key = utils.decryptPassword(hash);
    let getKeys = apiService.getPrivateKeysFromLogin(account, posting_key);
    if (!getKeys.data) {
      return res.json(
        utils.jsonResponse(
          null,
          CONSTANTS.PASSWORD_INVALID,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }

    let memo_key = getKeys.data.memo;
    const history = await apiService.getTransfers(account, memo_key);
    if (!history.data) {
      return res.json(
        utils.jsonResponse(
          null,
          history.error,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }

    return res.json(utils.jsonResponse(history.data, CONSTANTS.DATA_FETCH_OK));
  } catch (error) {
    return res.json(
      utils.jsonResponse(
        error.message,
        CONSTANTS.DATA_FETCH_FAILED,
        CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
      )
    );
  }
};

// Gets all transfer transactions of from and to accounts
// params: account_from|string, account_to|string
const getAllTransfersToUser = async (req, res) => {
  try {
    const { account_from, account_to, hash } = req.body;
    let messages = [];

    if (!account_from) {
      return res.json(
        utils.jsonResponse(
          null,
          CONSTANTS.SENDER_NOT_FOUND,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }
    if (!account_to) {
      return res.json(
        utils.jsonResponse(
          null,
          CONSTANTS.RECEIVER_NOT_FOUND,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }

    const posting_key = utils.decryptPassword(hash);
    let getKeys = apiService.getPrivateKeysFromLogin(account_from, posting_key);
    if (!getKeys.data) {
      return res.json(
        utils.jsonResponse(
          null,
          CONSTANTS.PASSWORD_INVALID,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }

    const memo_key = getKeys.data.memo;
    const history = await apiService.getTransfers(
      account_from,
      memo_key,
      account_to
    );
    if (!history.data) {
      return res.json(
        utils.jsonResponse(
          null,
          history.error,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }
    messages = history.data;
    return res.json(utils.jsonResponse(messages, CONSTANTS.DATA_FETCH_OK));
  } catch (error) {
    return res.json(
      utils.jsonResponse(
        error.message,
        CONSTANTS.DATA_FETCH_FAILED,
        CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
      )
    );
  }
};

module.exports = {
  sendMessage,
  getAllTransfers,
  getAllTransfersToUser,
};
