let client = require("redis")
const config = require("./appConfig")
if (config.REDIS.REQUIRE_PASS) {
    client = require('redis').createClient(
        config.REDIS.PORT,
        config.REDIS.HOST,
        {
            expire: 60,
            password: config.REDIS.PASSWORD
        });
} else {
    client = require('redis').createClient(
        config.REDIS.PORT,
        config.REDIS.HOST,
        { expire: 60 });
}

client.select(config.REDIS.DB)
client.on("connect", function (error) {
    if (error) {
        console.error(error)
    } else {
        console.log('Connected to redis server')
    }
});
module.exports = client;