const InitModule = require('./InitModule');
const initObject = new InitModule();
let MyntraProducts, StreetStyles, Users;
const batchSize  = 10000;
let dbObject;
initObject.getMongoDB()
  .then(dbo => {
    dbObject = dbo;
    console.log('Mode',process.env.mode)
    if(process.env.mode === "dev"){
      MyntraProducts = dbObject.collection("myntra_products_demo");
      StreetStyles = dbObject.collection("streetStyles_demo");
    } else if(process.env.mode === "test"){
      MyntraProducts = dbObject.collection("new_top_sell_myntra_products");
      StreetStyles = dbObject.collection("StreetStyles");
    } else {
      MyntraProducts = dbObject.collection("top_sell_myntra_products");
      StreetStyles = dbObject.collection("StreetStyles");
    }
    Users = dbObject.collection("grpcusers");
  })
  .catch(e => {
    console.log("Mongo Connection Failed", e);
  });

const validCreds = async function(credentails){
  let valid = await Users.findOne(credentails);
  if(valid){
    return true;
  }
  return false;
}
const ackProducts = async function(ids){
  console.log(`Acknowledging Recieval of ${ids.length} Style Ideas`)
  let products = await MyntraProducts.find({awaitACK: true}).project({product_id: 1}).toArray();
  let recievedProducts = products.filter(product => ids.indexOf(product.product_id) >= 0);
  let failedProducts = products.filter(product => ids.indexOf(product.product_id) < 0);
  console.log(`Failed recieval of ${failedProducts.length} Style Ideas`);
  //mark recieved products
  for(let i=0;i<recievedProducts.length;i+=batchSize){
    let batch = recievedProducts.slice(i,i+batchSize)
    await MyntraProducts.updateMany({
      product_id: {$in: batch.map(p => p.product_id)}
    },{
      $set:{
        awaitACK: false,
        readyForMyntra: false,
        assignedToMyntra: true,
        updated: false
      }
    })
  }
  //mark failed products for next batch
  for(let i=0;i<failedProducts.length;i+=batchSize){
    let batch = failedProducts.slice(i,i+batchSize)
    await MyntraProducts.updateMany({
      product_id: {$in: batch.map(p => p.product_id)}
    },{
      $set:{
        readyForMyntra: true,
        awaitACK: false,
        assignedToMyntra: false
      }
    })
  }
}
const ackStyles = async function(ids){
  console.log(`Acknowledging Recieval of ${ids.length} Street Styles`);
  let styles = await StreetStyles.find({awaitACK: true}).project({id: 1}).toArray();
  let recievedStyles = styles.filter(style => ids.indexOf(style.id) >= 0);
  let failedStyles = styles.filter(style => ids.indexOf(style.id) < 0);
  console.log(`Failed recieval of ${failedStyles.length} Street Styles`);
  //mark recieved Styles
  for(let i=0;i<recievedStyles.length;i+=batchSize){
    let batch = recievedStyles.slice(i,i+batchSize);
    await StreetStyles.updateMany({
      id: {$in: batch.map(s => s.id)}
    },{
      $set:{
        awaitACK: false,
        readyForMyntra: false,
        assignedToMyntra: true
      }
    })
  }
  //mark failed Styles for next batch
  for(let i=0;i<failedStyles.length;i+=batchSize){
    let batch = failedStyles.slice(i,i+batchSize);
    await StreetStyles.updateMany({
      id: {$in: batch.map(s => s.id)}
    },{
      $set:{
        readyForMyntra: true,
        awaitACK: false,
        assignedToMyntra: false
      }
    })
  }
}
const updateReturnedProducts = async function(products){
  for(let i=0;i<products.length;i+=batchSize){
    let batch = products.slice(i,i+batchSize);
    await MyntraProducts.updateMany({
      product_id: {$in: batch}
    },{
      $set:{
        awaitACK: true
      }
    })
  }
  return;
}
const updateReturnedStreetStyles = async function(styles){
  for(let i=0;i<styles.length;i+=batchSize){
    let batch = styles.slice(i,i+batchSize);
    await StreetStyles.updateMany({
      id: {$in: batch}
    },{
      $set:{
        awaitACK: true
      }
    })
  }
  return;
}
async function getProducts(){
  let products;
  if(process.env.mode === 'test'){
    products = await MyntraProducts.find({
      "mapped_images.source": "MarkableAI",
      readyForMyntra: true
    }).toArray();
  } else if(process.env.mode === 'dev'){
    products = await MyntraProducts.find({
      readyForMyntra: true
    }).toArray();
  } else {
    products = await MyntraProducts.find({
      readyForMyntra: true,
      reviewed: true
    }).toArray();
  }
  return products;
}
function getStyles(product){
  let styles = [];
  if(process.env.mode === 'test'){
    styles = product.mapped_images.filter(style => style.source === 'MarkableAI');
  } else if(process.env.mode === 'dev'){
    styles = product.mapped_images.filter(style => style.source === 'MarkableAI')
  } else {
    styles = product.mapped_images.filter(style => style.checked && style.source === 'MarkableAI');
  }
  return styles.map(style => style.name);
}
const getStyleIdeas = async function(){
  let products = await getProducts();
  console.log("products", products.length)
  let stylingIdeas = products.map(product => {
    let styles = getStyles(product);
    return {
      styleId: product.product_id,
      streetStylingObjectId: styles.slice(0,15)
    }
  });
  await updateReturnedProducts(products.map(product => product.product_id));
  return stylingIdeas;
}
function getStyleUrl(style){
  if(process.env.mode === 'test'){
    if(style.imageSource === "design-team"){
      return style.globalUrl;
    } else {
      return style.url;
    }
  } else if(process.env.mode === 'dev'){
    return style.url;
  } else {
    return style.globalUrl;
  }
}
const getStreetStyleIdeas = async function(){
  let styles = await StreetStyles.find({
    readyForMyntra: true
  }).toArray();
  console.log("Styles ", styles.length)
  let streetStyles = styles.map(style => {
    let credit = style.credit ? style.credit : "";
    return {
      id: style.id,
      imageUrl: getStyleUrl(style),
      credit: credit,
      shoppableItems: style.shoppableItems,
      myntraImageUrl: ""
    }
  })
  await updateReturnedStreetStyles(styles.map(style => style.id));
  return streetStyles;
}
const utils = {
  ackStyles,
  validCreds,
  ackProducts,
  getStyleIdeas,
  getStreetStyleIdeas
}
module.exports = utils;