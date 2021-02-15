const config = require("../config/appConfig");
const hive = require("@hiveio/hive-js");
const chainTypes = require("@hiveio/hive-js/lib/auth/serializer/src/ChainTypes");
const makeBitMaskFilter = require("@hiveio/hive-js/lib/auth/serializer/src/makeBitMaskFilter");
const dhive = require("@hiveio/dhive");
const utils = require("./utils");
const _ = require("lodash");
const moment = require("moment");
const globalStore = require("../globals/store");

const nodes = [
  "https://api.hive.blog",
  "https://anyx.io",
  "https://api.openhive.network",
  "https://api.hivekings.com",
];
const default_node = config.NODE_DEFAULT || nodes[0];

hive.config.set('rebranded_api', true)
hive.api.setOptions({ url: "https://api.hive.blog" });

const dhiveClient = (node = "", timeout = 10) => {
  const current_node = node ? node : default_node;
  let options = { timeout: timeout * 1000 };
  const Client = new dhive.Client(current_node, options);
  if (config.HF24_ENABLE) {
    options.rebrandedApi = true;
    Client.updateOperations(true);
  }
  return Client;
};

const getAccount = async (account) => {
  let response = { data: null, error: null };
  try {
    const acc = await dhiveClient().database.getAccounts([account]);
    if (acc && acc[0]) {
      response.data = acc[0];
    } else {
      response.error = "No data fetched";
    }
  } catch (error) {
    response.error = error ? error : "No data fetched";
  }
  return response;
};

const getPrivateKeysFromLogin = (account, password) => {
  let response = { data: null, error: null };
  let keys = { active: "", memo: "" };
  try {
    keys.active = dhive.PrivateKey.fromLogin(
      account,
      password,
      "active"
    ).toString();
    keys.memo = dhive.PrivateKey.fromLogin(
      account,
      password,
      "memo"
    ).toString();
    response.data = keys;
  } catch (error) {
    response.error = error ? error : "Invalid posting key";
  }
  return response;
};

const getPrivateKeysFrom = (key) => {
  let response = { data: null, error: null };
  try {
    const private_key = dhive.PrivateKey.from(key);
    if (private_key) {
      response.data = private_key;
    } else {
      response.error = "No data fetched";
    }
  } catch (error) {
    response.error = error ? error : "Invalid private key";
  }
  return response;
};

const testKey = (key, key_auths) => {
  let response = { data: false, error: null };
  try {
    let pub = hive.auth.wifToPublic(key);
    let filter = key_auths.filter((x) => x[0] === pub);
    response.data = filter.length > 0;
  } catch (error) {
    response.error = error;
  }
  return response;
};

const setAmountAsset = (amount, asset) => {
  let response = { data: null, error: null };
  amount = parseFloat(amount);
  try {
    const famount = dhive.Asset.from(amount, asset);
    response.data = famount;
  } catch (error) {
    response.error = error ? error : "Set amount asset failed";
  }
  return response;
};

const encryptMessage = (memo_key_from, memo_key_to, message) => {
  let response = { data: null, error: null };
  try {
    const encodedMsg = hive.memo.encode(
      memo_key_from,
      memo_key_to,
      "# " + message
    );
    if (encodedMsg) {
      response.data = encodedMsg;
    } else {
      response.error = "Message encryption failed";
    }
  } catch (error) {
    response.error = error ? error : "Message encryption failed";
  }
  return response;
};

const decryptMemo = (memo, memo_key_decrypted) => {
  let response = { data: null, error: null };
  try {
    if (utils.validateMemo(memo)) {
      const decodedMemo = hive.memo.decode(memo_key_decrypted, memo);
      if (decodedMemo) {
        response.data = decodedMemo;
      } else {
        response.error = "Memo decryption failed";
      }
    } else {
      response.error = "Invalid memo";
    }
  } catch (error) {
    response.error = error ? error : "Memo decryption failed";
  }
  return response;
};

const broadcastTransfer = async (payload) => {
  let response = { data: null, error: null };
  const { from, to, amount, memo, active_key } = payload;
  try {
    const transfer = await dhiveClient(default_node, 60).broadcast.transfer(
      { from, to, amount, memo },
      active_key
    );
    if (transfer) {
      response.data = transfer;
    } else {
      response.error = "Broadcast transfer failed";
    }
  } catch (error) {
    response.error = error ? error.message : "Broadcast transfer failed";
  }
  return response;
};

const getAccountHistory = async (account, start = -1, limit = 1000) => {
  let response = { data: null, error: null };
  const op = chainTypes.operations;
  const filter = makeBitMaskFilter([op.transfer]);
  try {
    let history = await new Promise((resolve, reject) => {
      hive.api.getAccountHistory(
        account,
        start,
        limit,
        filter[0],
        filter[1],
        ((err, result) => {
          if (!err) {
            resolve(result)
          } else {
            reject(err)
          }
        }))
    })
    if (history && history.length > 0) {
      history = _.orderBy(history, [0], ["desc"]);
      response.data = history;
    } else {
      response.error = "No data fetched";
    }
  } catch (error) {
    response.error = error ? error.message : "No data fetched";
  }
  return response;
};

const getTransfers = async (
  account_from,
  memo_key_decrypted = "",
  account_to = ""
) => {
  let response = { data: null, error: null };
  let transfers = [];
  try {
    const history = await getAccountHistory(account_from);
    if (!history.data) {
      response.error = history.error;
    } else {
      let transactions = history.data;
      if (account_to) {
        transactions = transactions.filter((x) => {
          const xdata = x[1].op[1];
          return xdata.from === account_to || xdata.to === account_to;
        });
      }
      if (transactions && transactions.length > 0) {
        transactions.forEach((trx) => {
          let data = trx[1].op[1];
          let amount_arr = data.amount.split(" ");
          amount_arr[0] = Number(amount_arr[0]);
          const time_value = moment.utc(trx[1].timestamp).valueOf();
          const main_user = data.from === account_from ? data.to : data.from;
          let decoded = "";
          if (memo_key_decrypted) {
            decoded = decryptMemo(data.memo, memo_key_decrypted).data || "";
          }
          let transfer = {
            number: trx[0],
            trx_id: trx[1].trx_id,
            time: trx[1].timestamp,
            time_value,
            main_user,
            from: data.from,
            to: data.to,
            amount: amount_arr[0],
            asset: amount_arr[1],
            memo: data.memo,
            decoded,
          };
          transfers.push(transfer);
        });
      }
      response.data = transfers;
    }
  } catch (error) {
    response.error = error ? error : "No data fetched";
  }
  return response;
};

const getTransfersGroupByMainUser = async (
  account_from,
  memo_key = ""
) => {
  let response = { data: null, error: null };
  let chatList = [];
  try {
    const transfers = await getTransfers(account_from, memo_key);
    if (transfers.data) {
      const transferData = transfers.data;
      const unique_users = [
        ...new Set(transferData.map((item) => item.main_user)),
      ];
      if (unique_users && unique_users.length > 0) {
        unique_users.forEach((user) => {
          let messages = transferData.filter((x) => x.main_user === user);
          chatList.push({
            username: user,
            messages: utils.sortArrayObject(messages, "number", "asc"),
          });
        });
      }
    }
    const getOnlineStatuses = await globalStore.mapArrayOnlineStatus("username", chatList)
    await Promise.all([getOnlineStatuses])

    response.data = chatList;
  } catch (error) {
    response.error = error ? error : "No data fetched";
  }
  return response;
};

const lookupAccounts = async (account, limit = 10) => {
  let response = { data: null, error: null };
  let accounts = []
  try {
    accounts = await new Promise((resolve, reject) => {
      hive.api.lookupAccounts(account, limit,
        ((err, result) => {
          if (!err) {
            resolve(result)
          } else {
            reject(err)
          }
        }))
    });

    response.data = accounts
  } catch (error) {
    response.error = error ? error : "No data fetched";
  }

  return response;

}

module.exports = {
  getAccount,
  getPrivateKeysFromLogin,
  getPrivateKeysFrom,
  testKey,
  setAmountAsset,
  encryptMessage,
  decryptMemo,
  broadcastTransfer,
  getAccountHistory,
  getTransfers,
  getTransfersGroupByMainUser,
  lookupAccounts
};
