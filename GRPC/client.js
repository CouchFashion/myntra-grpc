const PROTO_PATH = __dirname + '/../protos/Cfstream.proto';
const recommendations = require('../data/recommendations.json')
const streetStyleObjects = require('../data/streetStyles.json')
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
export function SetStylingIdeas(client, styleIds, repeatedCount = 0){
  let call = client.setStylingIdeas(function(err, response) {
    if(err){console.log('Error: ',err)} 
    else{
      let savedStylesCount = Number(response.savedStylesCount);
      if(savedStylesCount === styleIds.length){
        // Batch Successful
      } else if((savedStylesCount === 0 || savedStylesCount/styleIds.length < 0.1) && repeatedCount < 5){
        console.log("Resending Batch",styleIds)
        SetStylingIdeas(client, styleIds, repeatedCount + 1);
      } else {
        //send alert
        console.log("Batch Failed",styleIds)
      }
    }
  });
  let stylingIdeas = [];
  for(let id of styleIds){
    stylingIdeas.push({
      styleId: id, 
      streetStylingObjectId: recommendations[id]
    })
  }
  call.write({
    stylingIdeas: stylingIdeas
  })
  call.end();
}
export function SetStreetStylingIdeas(client, streetStyleIds, repeatedCount = 0) {
  let call = client.setStreetStylingIdeas(function(err, response) {
    console.log("SSSI Response",response);
    if(err){console.log('Error: ',err)} 
    else{
      let savedIdsCount = Number(response.savedStreetStyleIds);
      if(savedIdsCount === streetStyleIds.length){
        console.log("Batch Successful");
      } else if((savedIdsCount === 0 || savedIdsCount/streetStyleIds.length < 0.1) && repeatedCount < 5){
        console.log("Resending Batch",streetStyleIds)
        SetStreetStylingIdeas(client, streetStyleIds, repeatedCount + 1)
      } else {
        //send alert
        console.log("Batch Failed",streetStyleIds)
      }
    }
  });
  let streetStyles = [];
  for(let id of streetStyleIds){
    streetStyles = [...streetStyles, streetStyleObjects[id]]
  }
  call.write({
    streetStyles: streetStyles
  })
  call.end();
}

SetStylingIdeas(client,Object.keys(recommendations))

SetStreetStylingIdeas(client, Object.keys(streetStyleObjects))