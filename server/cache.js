var MemJS = require('memjs').Client;
var config = (process.env.DATABASE_URL) ? process.env.DATABASE_URL :  require(__dirname + '/config').memcache;

var MEMCACHEDCLOUD_USERNAME = process.env.MEMCACHEDCLOUD_USERNAME || config.username
var MEMCACHEDCLOUD_SERVERS = process.env.MEMCACHEDCLOUD_SERVERS ||  config.server
var MEMCACHEDCLOUD_PASSWORD = process.env.MEMCACHEDCLOUD_PASSWORD || config.password
var memjs = undefined ;

module.exports.connect = function() {
    memjs = MemJS.create(MEMCACHEDCLOUD_USERNAME + ":" + MEMCACHEDCLOUD_PASSWORD + "@" + MEMCACHEDCLOUD_SERVERS);
    return memjs
}

module.exports.get = function(key, callback) {
    memjs.get(key, function(err,value,key){
      if(err){
        callback(err)
      }else{
        callback(null,JSON.parse(value))
      }

    }, 86400);
};
module.exports.set = function(key, value,cb) {
    memjs.set(key, JSON.stringify(value), function(error, result) {
      if(error){
        cb(err)
      }else{
        cb(null,result)
      }
    }, 86400);

};
