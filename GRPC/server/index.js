const PROTO_PATH = __dirname + '/../../protos/alamodeStream.proto';
const recommendations = require("../../data/recommendations.json");
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const hello_proto = grpc.loadPackageDefinition(packageDefinition).proto;
const fs = require('fs');
const path = require('path');
const utils = require("./util");

const nJwt = require("njwt");
let secretKey = require("./secretKey.json")
secretKey = Buffer.from(secretKey.data);

function getJWT(username){
  let claims = {
    user: username,
    type: "client",
    timeOfIssuance: new Date().getTime()
  }
  let jwtToken = nJwt.create(claims, secretKey)
  jwtToken.setExpiration(new Date().getTime() + (60*60*1000));
  return jwtToken.compact()
}
function checkToken(jwtToken){
  return new Promise((resolve, reject) => {
    nJwt.verify(jwtToken, secretKey, function (error, verifiedJwt) {
      if (error) {
        resolve({
          isAuthenticated: false,
          error
        })
      } else {
        resolve({
          isAuthenticated: true,
          verifiedJwt
        })
      }
    })
  }) 
}
async function Login(call, callback){
  let creds = call.request;
  try {
    let valid = await utils.validCreds(creds);
    if(valid){
      let token = getJWT(creds.username);
      callback(null,{
        jwtToken: token,
        statusCode: 200,
        statusDetail: "OK"
      })
    } else {
      callback(null,{
        jwtToken: '',
        statusCode: 401,
        statusDetail: "Invalid Credentials"
      })
    }
  } catch (error) {
    callback(null,{
      jwtToken: '',
      statusCode: 500,
      statusDetail: error.message
    })
    //To-Do: email the error from here
  }
}
async function authenticateRequest(token){
  let verification = await checkToken(token);
  if(!verification.isAuthenticated){
    // un authenticated request
    return {
      authenticated: false,
      errorMessage: verification.error.message
    }
  } else {
    return {
      authenticated: true,
      jwtToken: verification.verifiedJwt
    }
  }
}
async function GetStylingIdeas(call, callback) {
  try {
    let token = call.request.authToken; //authorization Token
    let auth = await authenticateRequest(token);
    if(auth.authenticated){
      // let stylingIdeas = await utils.getStyleIdeas();
      let stylingIdeas = Object.keys(recommendations).map(key => {
        return {
          styleId: key,
          streetStylingObjectId: recommendations[key]
        }
      })
      
      call.write({
        statusCode: 200,
        statusDetail: "Ok",
        stylingIdeas: [stylingIdeas[0]],
        stylingIdeasCount: 1    //batchwise length
      })
      call.write({
        statusCode: 200,
        statusDetail: "Ok",
        stylingIdeas: [stylingIdeas[1]],
        stylingIdeasCount: 1    //batchwise length
      })
      call.end();
    } else {
      callback(null ,{
        statusCode: 403,
        statusDetail: auth.errorMessage,
        stylingIdeas: [],
        stylingIdeasCount: 0
      })
    }    
  } catch (error) {
    callback(null,{
      statusCode: 500,
      statusDetail: "Internal Error",
      stylingIdeas: [],
      stylingIdeasCount: 0
    })
    //To-Do: email the error from here
  }
}
async function GetStreetStylingIdeas(call, callback) {
  try {
    let token = call.request.authToken; //authorization Token
    let auth = await authenticateRequest(token);
    if(auth.authenticated){
      // let streetStyles = await utils.getStreetStyleIdeas();
      let streetStyles = [];
      call.write({
        statusCode: 200,
        statusDetail: "Ok",
        streetStyles,
        streetStylesCount: streetStyles.length
      })
      call.end();
    } else {
      callback(null ,{
        statusCode: 403,
        statusDetail: auth.errorMessage,
        streetStyles: [],
        streetStylesCount: 0
      })
    }    
  } catch (error) {
    callback(null,{
      statusCode: 500,
      statusDetail: "Internal Error",
      streetStyles: [],
      streetStylesCount: 0
    })
    //To-Do: email the error from here
  }
}

function main() {
  //ssl on
  const rootCert = fs.readFileSync(path.join(__dirname, "server-certs", "ca.crt"));
  const privateKey = fs.readFileSync(path.join(__dirname, "server-certs", "server.key"));
  const certChain = fs.readFileSync(path.join(__dirname, "server-certs", "server.crt"));
  const keyCertPairs = [{private_key:privateKey,cert_chain:certChain}];
  const checkClientCertificate = true;
  
  const server = new grpc.Server();
  server.addService(hello_proto.alamodeStream.service, {
    login: Login,
    getStylingIdeas: GetStylingIdeas, 
    getStreetStylingIdeas: GetStreetStylingIdeas
  });
  server.bind(
    '0.0.0.0:50051', 
    grpc.ServerCredentials.createInsecure()
    // grpc.ServerCredentials.createSsl(rootCert,keyCertPairs, checkClientCertificate)
    );
    server.start();
  }
  
  main();
  
  // server.bind('0.0.0.0:50051', grpc.ServerCredentials.createSsl({
  //   rootCerts: fs.readFileSync(path.join(process.cwd, "server-certs", "Snazzy_Microservices.crt")),
  //   keyCertPairs: [
  //     {
  //       privateKey: fs.readFileSync(path.join(process.cwd, "server-certs", "login.services.widgets.inc.key")),
  //       certChain: fs.readFileSync(path.join(process.cwd, "server-certs", "login.services.widgets.inc.crt")),
  //     }
  //   ],
  //   checkClientCertificate: true,
  // }));
  
  
  
  // `privkey.pem`  : the private key for your certificate.
  // `fullchain.pem`: the certificate file used in most server software.  //ca.crt
  // `chain.pem`    : used for OCSP stapling in Nginx >=1.3.7.
  // `cert.pem`     : will break many server configurations, and should not be used
  //                  without reading further documentation (see link below). //server.crt
  
  // WARNING: DO NOT MOVE OR RENAME THESE FILES!
  //          Certbot expects these files to remain in this location in order
  //          to function properly!
  
  // We recommend not moving these files. For more information, see the Certbot
  // User Guide at https://certbot.eff.org/docs/using.html#where-are-my-certificates.
  