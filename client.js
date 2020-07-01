const PROTO_PATH = __dirname + '/protos/stream.proto';
const recommendations = require('./data/recommendations.json')
const streetStyles = require('./data/streetStyles.json')
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

const client = new hello_proto.stream(
  '0.0.0.0:50051',
  grpc.credentials.createInsecure()
);
function SetStylingIdeas(client, styleIds){
  let call = client.setStylingIdeas(function(err, response) {
    if(err){console.log('Error: ',err)} 
    else{
      let ids = response.styleId;
      if(ids && ids.length > 0){
        SetStylingIdeas(client, ids);        
      }
    }
  });
  for(let id of styleIds){
    call.write({
      stylingIdeas: [{
        styleId: id, 
        streetStylingObjectId: recommendations[id]
      }]
    })
  }
  call.end();
}
function SetStreetStylingIdeas(client, streetStyleIds) {
  let call = client.setStreetStylingIdeas(function(err, response) {
    if(err){console.log('Error: ',err)} 
    else{
      let ids = response.streetStyleIds;
      if(ids && ids.length > 0){
        SetStreetStylingIdeas(client, ids)
      }
    }
  });
  for(let id of streetStyleIds){
    call.write({
      streetStyles: [streetStyles[id]]
    })
  }
  call.end();
}


SetStylingIdeas(client,Object.keys(recommendations))

SetStreetStylingIdeas(client, Object.keys(streetStyles))