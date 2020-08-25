const InitModule = require('./InitModule');
const initObject = new InitModule();

let dbObject;
initObject.getMongoDB()
  .then(dbo => {
    dbObject = dbo;
  })
  .catch(e => {
    console.log("Mongo Connection Failed", e);
  });

const validCreds = async function(credentails){
  let valid = await dbObject.collection("grpcusers").findOne(credentails);
  if(valid){
    return true;
  }
  return false;
}

const utils = {validCreds}
module.exports = utils;