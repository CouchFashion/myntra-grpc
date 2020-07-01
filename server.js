var PROTO_PATH = __dirname + '/protos/stream.proto';

var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
var hello_proto = grpc.loadPackageDefinition(
    packageDefinition
  ).proto;

function SetStylingIdeas(call, callback) {
  let stylingIdeas = [];
  call.on('data', el => {
    el = el.stylingIdeas[0]
    if(el.styleId && el.styleId !== null){
      stylingIdeas.push(el);
    }
  })
  call.on('end',() => {
    if(stylingIdeas[0].styleId !== "7694535")
      callback(null, {styleId: ["7694535"]})
    else
      callback(null, {styleId: []})
  })
}
function SetStreetStylingIdeas(call, callback) {
  let streetStyles = [];
  call.on('data', el => {
    el = el.streetStyles[0]
    if(el.id && el.id !== null){
      streetStyles.push(el);
    }
  })
  call.on('end',() => {
    if(streetStyles[0].id !== "ss7")
      callback(null, {streetStyleIds: ["ss7"]})
    else
      callback(null, {streetStyleIds: []})
  })
}
function main() {
  var server = new grpc.Server();
  server.addService(hello_proto.stream.service, {
    setStylingIdeas: SetStylingIdeas, 
    setStreetStylingIdeas: SetStreetStylingIdeas
  });
  server.bind(
    '0.0.0.0:50051', 
    grpc.ServerCredentials.createInsecure()
  );
  server.start();
}

main();

