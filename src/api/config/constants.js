const _this = {
    /* Validation related  constants starts*/
    USERNAME_NOT_FOUND : `username is required`,
    PASSWORD_NOT_FOUND: `password is required`,
    USERID_NOT_FOUND: `user_id is required`,
    ACCOUNT_NOT_FOUND: `account is required`,
    ACTIVEKEY_NOT_FOUND: `active key is required`, 
    MEMOKEY_NOT_FOUND: `memo key is required`, 
    MESSAGE_NOT_FOUND: `message is required`,
    AMOUNT_NOT_FOUND: `amount is required`,
    SENDER_NOT_FOUND: `sender's username is required`,
    RECEIVER_NOT_FOUND: `receiver's username is required`,

    ACCOUNT_INVALID: `invalid account`,
    PASSWORD_INVALID: `invalid password`,
    ACTIVEKEY_INVALID: `invalid active key`,
    MEMOKEY_INVALID: `invalid memo key`,
    CURRENCY_INVALID: `invalid currency`,
    RECEIVER_INVALID: `invalid receiver's account`,

    AUTH_FAILED: `Authentication failed. Something went wrong...`,
    AUTH_SUCCESS: `Authenticated successfully`,
    LOGIN_OK: `user logged in`,
    LOGIN_FAILED: `user is not logged in`,
    DATA_FETCH_OK: `Data fetched successfully`,
    DATA_FETCH_FAILED: `No data fetched. Something went wrong...`,
    MESSAGE_SEND_OK: `Message successfully sent`,
    MESSAGE_SEND_FAILED: `Message sending failed. Something went wrong...`,

    /* Validation related  constants ends*/

    /* HTTP status code constant starts */
    SERVER_ERROR_HTTP_CODE : 412,
    SERVER_NOT_ALLOWED_HTTP_CODE : 503,
    SERVER_OK_HTTP_CODE : 200,  
    SERVER_NOT_FOUND_HTTP_CODE : 400,
    /* HTTP status codeconstant ends */
}

module.exports = _this