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
const getStyleIdeas = async function(){
  let products = await dbObject.collection("top-sell-myntra-products").find({
    reviewed: true,
    readyForMyntra: true
  });
  let stylingIdeas = products.map(product => {
    let styles = product.mapped_images.filter(style => style.checked && !style.hide)
    return {
      styleId: product.product_id,
      streetStylingObjectId: styles.map(style => style.name)
    }
  });
  return stylingIdeas;
}
const getStreetStyleIdeas = async function(){
  let streetStyles = await dbObject.collection("StreetStyles").find({

  });
  streetStyles = streetStyles.map(style => {
    let credit = style.credit ? style.credit : "";
    return {
      id: style.id,
      imageUrl: style.globalUrl,
      credit: credit,
      shoppableItems: style.shoppableItems,
      myntraImageUrl: ""
    }
  })
  return streetStyles;
}
const utils = {
  validCreds,
  getStyleIdeas,
  getStreetStyleIdeas
}
module.exports = utils;