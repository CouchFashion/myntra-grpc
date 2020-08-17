var PROTO_PATH = __dirname + '/../protos/alamodeStream.proto';

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
    el.stylingIdeas.map(el => {
      if(el.styleId && el.styleId !== null){
        stylingIdeas.push(el);
      }
    })
  })
  call.on('end',() => {
    console.log(stylingIdeas.length)
    callback(null, {
      statusCode: "200",
      statusDetail: "OK",
      savedStylesCount: 0
    })
    // if(stylingIdeas[0].styleId !== "7694535")
    // else
    //   callback(null, {styleId: []})
  })
}
function SetStreetStylingIdeas(call, callback) {
  let streetStyles = [];
  call.on('data', el => {
    el.streetStyles.map(el => {
      if(el.id && el.id !== null){
        streetStyles.push(el);
      }
    })
    // el = el.streetStyles[0]
  })
  call.on('end',() => {
    console.log(streetStyles.length)
    callback(null, {
      statusCode: "200",
      statusDetail: "OK",
      savedStreetStyleIds: streetStyles.length
    })
    // if(streetStyles[0].id !== "ss7")
    // else
    //   callback(null, {streetStyleIds: []})
  })
}
function main() {
  var server = new grpc.Server();
  server.addService(hello_proto.alamodeStream.service, {
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

