var mongo = require('mongodb');
var Config = require('./config');
var MongoClient = mongo.MongoClient;

class InitModule {

  constructor() {}

  getMongoDB() {
    try {
      return new Promise((resolve, reject) => {
        MongoClient.connect(Config.mongoConfig.URI, function (err, db) {
          if (err) {
            reject(err);
          }
          var dbo = db.db(Config.mongoConfig.DB_NAME);
          resolve(dbo);
        })
      });
    } catch (e) {
      console.log(e);
    }

  }
}
exports = module.exports = InitModule;