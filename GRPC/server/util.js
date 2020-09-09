const InitModule = require('./InitModule');
const initObject = new InitModule();
let MyntraProducts, StreetStyles, Users;
const batchSize  = 10000;
let dbObject;
initObject.getMongoDB()
  .then(dbo => {
    dbObject = dbo;
    MyntraProducts = dbObject.collection("top_sell_myntra_products");
    StreetStyles = dbObject.collection("StreetStyles");
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
  let products = await MyntraProducts.find({awaitACK: true}).project({product_id: 1}).toArray();
  let recievedProducts = products.filter(product => ids.indexOf(product.product_id) >= 0);
  let failedProducts = products.filter(product => ids.indexOf(product.product_id) < 0);
  //mark recieved products
  for(let i=0;i<recievedProducts.length;i+=batchSize){
    let batch = recievedProducts.slice(i,i+batchSize)
    MyntraProducts.updateMany({
      product_id: {$in: batch.map(p => p.product_id)}
    },{
      $set:{
        awaitACK: false
      }
    })
  }
  //mark failed products for next batch
  for(let i=0;i<failedProducts.length;i+=batchSize){
    let batch = failedProducts.slice(i,i+batchSize)
    MyntraProducts.updateOne({
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
  let styles = await StreetStyles.find({awaitACK: true}).project({id: 1}).toArray();
  let recievedStyles = styles.filter(style => ids.indexOf(style.id) >= 0);
  let failedStyles = styles.filter(style => ids.indexOf(style.id) < 0);
  //mark recieved products
  for(let i=0;i<recievedStyles.length;i+=batchSize){
    let batch = recievedStyles.slice(i,i+batchSize);
    StreetStyles.updateOne({
      id: {$in: batch.map(s => s.id)}
    },{
      $set:{
        awaitACK: false
      }
    })
  }
  //mark failed products for next batch
  for(let i=0;i<failedStyles.length;i+=batchSize){
    let batch = failedStyles.slice(i,i+batchSize);
    StreetStyles.updateOne({
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
  await MyntraProducts.updateMany({
    product_id: {$in: products.map(p => p.id)}
  },{
    $set:{
      readyForMyntra: false,
      awaitACK: true,
      assignedToMyntra: true
    }
  })
  let promises = [];
  // for(let i=0;i<products.length; i++){
  //   promises.push(
  //     MyntraProducts.updateOne({product_id: products[i].id},{
  //       $set:{
  //         readyForMyntra: false,
  //         awaitACK: true,
  //         assignedToMyntra: true
  //       }
  //     })
  //   )
  //   let date = new Date();
  //   promises.push(
  //     MyntraProducts.updateOne({product_id: products[i].id},{
  //       $push:{
  //         "returnedVersions": {
  //           "user":"",
  //           "version": products[i].version,
  //           "date": date.getUTCDate()
  //         }
  //       }
  //     })
  //   )
  // }
  // await Promise.all(promises);
  return;
}
const updateReturnedStreetStyles = async function(styles){
  await StreetStyles.updateMany({
    id: styles.map(s => s.id)
  },{
    $set:{
      readyForMyntra: false,
      awaitACK: true,
      assignedToMyntra: true
    }
  })
  // let promises = [];
  // for(let i=0;i<styles.length; i++){
  //   promises.push(
  //     StreetStyles.updateOne({id: styles[i].id},{
  //       $set:{
  //         readyForMyntra: false,
  //         awaitACK: true,
  //         assignedToMyntra: true
  //       }
  //     })
  //   )
  //   let date = new Date();
  //   promises.push(
  //     StreetStyles.updateOne({id: styles[i].id},{
  //       $push:{
  //         "returnedVersions": {
  //           "user":"",
  //           "version": styles[i].version,
  //           "date": date.getUTCDate()
  //         }
  //       }
  //     })
  //   )
  // }
  // await Promise.all(promises);
  return;
}
const getStyleIdeas = async function(){
  let products = await MyntraProducts.find({
    // readyForMyntra: true,
    reviewed: true
  }).toArray();
  console.log("products", products.length)
  let stylingIdeas = products.map(product => {
    let styles = product.mapped_images.filter(style => style.checked && !style.hide)
    return {
      styleId: product.product_id,
      streetStylingObjectId: styles.map(style => style.name)
    }
  });
  await updateReturnedProducts(products.map(product => {
    return {
      id: product.product_id,
      version: product.version
    }
  }))
  return stylingIdeas;
}
const getStreetStyleIdeas = async function(){
  let styles = await StreetStyles.find({
    readyForMyntra: true
  }).toArray();
  let streetStyles = styles.map(style => {
    let credit = style.credit ? style.credit : "";
    return {
      id: style.id,
      imageUrl: style.globalUrl,
      credit: credit,
      shoppableItems: style.shoppableItems,
      myntraImageUrl: ""
    }
  })
  await updateReturnedStreetStyles(styles.map(style => {
    return {
      id: style.id,
      version: style.version
    }
  }))
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