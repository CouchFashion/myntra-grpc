const recommendations = require('./data/recommendations.json');
const streetStyleObjects = require('./data/streetStyles.json');
const {Login, GetStylingIdeas,GetStreetStylingIdeas} = require("./GRPC/client/");  //Resolutions => OK | FAILED

(async () => {
  let productsIds = Object.keys(recommendations);
  let streetStyleIds = Object.keys(streetStyleObjects);
  console.log("start");
  let stylingIdeas = [];
  for(let id of productsIds){
    stylingIdeas.push({
      styleId: id, 
      streetStylingObjectId: recommendations[id]
    })
  }
  try {
    let res = await SetStylingIdeas(stylingIdeas)
    console.log("End ",res);
  } catch (error) {
    console.log(error)
  }
  let streetStyles = [];
  for(let id of streetStyleIds){
    streetStyles = [...streetStyles, streetStyleObjects[id]]
  }
  console.log("Start SSSI");
  try {
    res = await SetStreetStylingIdeas(streetStyles);
    console.log("End ",res);    
  } catch (error) {
    console.log(error)
  }
});

const {sendMail} = require("./Mailer");
const {GRPC_SOURCE} = require("./constants/index.js");
(async () => {
  console.log(GRPC_SOURCE)
  let res = await sendMail("chiragagrawal65@gmail.com","Test",`
    <p> Hi this is a test Message</p>
  `);
  console.log(res)
});
// Varun Bansal 8010322322

(async () => {
  let res = await Login("myntra-tech","WTJZcWJYbHVkSEpoWDNOMGVXeGxhVzV6Y0dseVlYUnBiMjQ9");
  console.log(res)
  setTimeout(async () => {
    let res1 = await GetStylingIdeas(res.jwtToken);
    console.log(JSON.parse(JSON.stringify(res1)))
  },2000)
})();