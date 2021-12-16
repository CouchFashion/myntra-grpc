const PROTO_PATH = __dirname + '/../../protos/Flipstream.proto';
const {GRPC_SOURCE} = require("../../constants");
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');
const path = require('path');
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
const rootCert = fs.readFileSync(path.join(__dirname, "../server/server-certs/cat_flip.crt"))//"../server/server-certs", "cat_flip.crt"));
const client = new hello_proto.alamodeStream(
   '127.0.0.1:50053',
  grpc.credentials.createInsecure() 
  // 'grpcflipkart.couchfashion.com',
  // grpc.credentials.createSsl(rootCert)
);
// client.send(null, meta, null);
const Login = async function(id, pass){
  return new Promise((resolve, reject) => {
    client.login({username:id, password: pass}, function(err,response) {
      if(err){
        reject(err)
      } else{
        resolve(response);
      }
    })
  });
}
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
const GetStylingIdeas = async function(token){
  return new Promise((resolve, reject) => {
    let at = { jwtToken: token}
    let call = client.GetStylingIdeas(at);
    let a = [];
    call.on('data', function(stylingideas){
      a.push(stylingideas)
    })
    call.on('end',function(){
      resolve(a)
    })
    call.on('error',function(err){
      console.log(err.message)
    })
  })
}
const GetStreetStylingIdeas = async function(token){
  return new Promise((resolve, reject) => {
    let at = { jwtToken: token}
    let call = client.GetStreetStylingIdeas(at);
    let a = [];
    call.on('data', function(streetStyles){
      a.push(streetStyles)
    })
    call.on('end',function(){
      resolve(a)
    })
  })
}
const AckStyleIdeas = async function(token, styleIds){
  return new Promise((resolve,reject) => {
    client.AckStylingIdeas({jwtToken: token,styleIds },function(err, response){
      if(err) reject(err)
      resolve(response);
    })
  })
}
const AckStreetStyles = async function(token, styleIds){
  return new Promise((resolve,reject) => {
    client.AckStreetStyles({jwtToken: token,streetStyleObjectId: styleIds },function(err, response){
      if(err) reject(err)
      resolve(response);
    })
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

module.exports = {GetStylingIdeas,Login, GetStreetStylingIdeas, AckStyleIdeas, AckStreetStyles}