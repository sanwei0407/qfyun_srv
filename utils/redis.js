// npm i ioredis 
const ioRedis = require("ioredis");
const redis = new ioRedis();

  redis.on("error", function (error) {
   console.log(error)
  });

module.exports = redis;