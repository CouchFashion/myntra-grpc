const PROTO_PATH = __dirname + '/../protos/alamodeStream.proto';
const {GRPC_SOURCE} = require("../constants");
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync(PROTO_PATH,
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  });
const hello_proto = grpc.loadPackageDefinition(
    packageDefinition
  ).proto;

const client = new hello_proto.alamodeStream(
  '0.0.0.0:50051',
  grpc.credentials.createInsecure()
);
const SetStylingIdeas = async function(stylingIdeas, repeatedCount = 0){
  return new Promise((resolve,reject) => {
    try {
      let styleIds = stylingIdeas.map(el => el.styleId)
      let call = client.setStylingIdeas(function(err, response) {
        if(err){
          reject(err)
        } else{
          let savedStylesCount = Number(response.savedStylesCount);
          if(savedStylesCount === styleIds.length){
            // Batch Successful
            resolve({
              status: GRPC_SOURCE.OK,
              response: response
            });
          } else if((savedStylesCount === 0 || savedStylesCount/styleIds.length < 0.1) && repeatedCount < 5){
            console.log("Resending Batch",styleIds)
            SetStylingIdeas(stylingIdeas, repeatedCount + 1)
            .then(res => {
              resolve({
                status: res.status,
                response: res.response
              });
            })
            .catch(error => reject(error))
          } else {
            // Batch Failed
            resolve({
              status: GRPC_SOURCE.FAILED,
              response: response
            });
          }
        }
      });      
      call.write({
        stylingIdeas: stylingIdeas
      })
      call.end();
    } catch (error) {
      reject(error);
    }
  })
}
const SetStreetStylingIdeas = async function(streetStyles, repeatedCount = 0) {
  return new Promise((resolve,reject) => {
    try {
      let streetStyleIds = streetStyles.map(el => el.id);
      let call = client.setStreetStylingIdeas(function(err, response) {
        if(err){reject(err)} 
        else{
          let savedIdsCount = Number(response.savedStreetStyleIds);
          if(savedIdsCount === streetStyleIds.length){
            // Batch Successful
            resolve({
              status: GRPC_SOURCE.OK,
              response: response
            });
          } else if((savedIdsCount === 0 || savedIdsCount/streetStyleIds.length < 0.1) && repeatedCount < 5){
            console.log("Resending Batch",streetStyleIds)
            SetStreetStylingIdeas(streetStyles, repeatedCount + 1)
            .then(res => {
              resolve({
                status: res.status,
                response: res.response
              });
            })
            .catch(error => reject(error))
          } else {
            // Batch Failed
            resolve({
              status: GRPC_SOURCE.FAILED,
              response: response
            });
          }
        }
      });
      call.write({
        streetStyles: streetStyles
      })
      call.end();      
    } catch (error) {
      reject(error);
    }
  })
}

module.exports = {SetStylingIdeas,SetStreetStylingIdeas}