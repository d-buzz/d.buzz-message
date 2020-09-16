const ENV = process.env;
const config = {
    HOST: ENV.APP_HOST,
    PORT: ENV.APP_PORT,
    NODE_DEFAULT: ENV.NODE_DEFAULT,
    ENCRYPT_MSG: ENV.ENCRYPT_MSG || true,
    MIN_AMOUNT: ENV.MIN_AMOUNT,
    CURRENCY: ENV.CURRENCY,
    ALLOWED_CURRENCIES: ['HIVE','HBD'],
}

module.exports = config;