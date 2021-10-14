const InitModule = require('./InitModule');
const initObject = new InitModule();
let MyntraProducts, StreetStyles, Users;
const constants = require("../../constants");
const batchSize  = 10000;
let dbObject;
initObject.getMongoDB()
  .then(dbo => {
    dbObject = dbo;
    console.log('Mode',process.env.mode)
   /*  if(process.env.mode === "dev"){
      MyntraProducts = dbObject.collection("myntra_products_demo");
      StreetStyles = dbObject.collection("streetStyles_demo");
    } else if(process.env.mode === "test"){
      MyntraProducts = dbObject.collection("top_sell_myntra_products");
      StreetStyles = dbObject.collection("StreetStyles");
    } else { */
      MyntraProducts = dbObject.collection("top_sell_flipkart_products");
      StreetStyles = dbObject.collection("flipkart_SS");
    //}
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
 /*  for(let i=0;i<recievedProducts.length;i+=batchSize){
    let batch = recievedProducts.slice(i,i+batchSize)
    await MyntraProducts.updateMany({
      product_id: {$in: batch.map(p => p.product_id)}
    },{
      $set:{
        awaitACK: false,
        readyForFlipkart: false,
        assignedToFlipkart: true,
        updated: false
      }
    })
  } */
  //mark failed products for next batch
  /* for(let i=0;i<failedProducts.length;i+=batchSize){
    let batch = failedProducts.slice(i,i+batchSize)
    await MyntraProducts.updateMany({
      product_id: {$in: batch.map(p => p.product_id)}
    },{
      $set:{
        readyForFlipkart: true,
        awaitACK: false,
        assignedToFlipkart: false
      }
    })
  } */
}
const ackStyles = async function(ids){
  console.log(`Acknowledging Recieval of ${ids.length} Street Styles`);
  let styles = await StreetStyles.find({awaitACK: true}).project({id: 1}).toArray();
  let recievedStyles = styles.filter(style => ids.indexOf(style.id) >= 0);
  let failedStyles = styles.filter(style => ids.indexOf(style.id) < 0);
  console.log(`Failed recieval of ${failedStyles.length} Street Styles`);
  //mark recieved Styles
 /*  for(let i=0;i<recievedStyles.length;i+=batchSize){
    let batch = recievedStyles.slice(i,i+batchSize);
    await StreetStyles.updateMany({
      id: {$in: batch.map(s => s.id)}
    },{
      $set:{
        awaitACK: false,
        readyforflipkart: false,
        assignedToFlipkart: true,
        isUpdated: false
      }
    })
  } */
  //mark failed Styles for next batch
  /* for(let i=0;i<failedStyles.length;i+=batchSize){
    let batch = failedStyles.slice(i,i+batchSize);
    await StreetStyles.updateMany({
      id: {$in: batch.map(s => s.id)}
    },{
      $set:{
        readyforflipkart: true,
        awaitACK: false,
        assignedToFlipkart: false
      }
    })
  } */
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
async function getProducts(user){
  let products;
/*   if(process.env.mode === 'test'){
    if(user === "fk-tech"){
      products = await MyntraProducts.find({
        readyForFlipkart: true
      }).toArray();
    } else{
      products = await MyntraProducts.find({
        readyForMyntra: true
      }).toArray();
    }
  } else if(process.env.mode === 'dev'){
    products = await MyntraProducts.find({
      readyForMyntra: true
    }).toArray();
  } else { */
    products = await MyntraProducts.find({
      readyForFlipkart: true,
      reviewed: true
    }).toArray();
  //}
  return products;
}
function getStyles(product){
  let styles = [];
  //TO DISABLE THE RECOMMENDATIONS OF A LOT OF PRODUCTS THAT ARE MARKED AS READY FOR MYNTRA
  // return styles;
/*   if(process.env.mode === 'test'){
    styles = product.mapped_images.filter(style => style.source === 'MarkableAI' && style.checked).slice(0,7);
  } else if(process.env.mode === 'dev'){
    styles = product.mapped_images.filter(style => style.source === 'MarkableAI')
  } else { */
    styles = product.mapped_images.filter(style => style.checked);
 // }
  return styles.map(style => style.name);
}
const getStyleIdeas = async function(user){
  let products = await getProducts(user);
  console.log("products", products.length)
  let stylingIdeas = products.map(product => {
    let styles = getStyles(product);
    return {
      styleId: product.product_id,
      streetStylingObjectId: styles
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
      if(style.isCropped){
        let version = style.versions.pop();
        return version.url;
      }
      return style.url;
    }
  } else if(process.env.mode === 'dev'){
    return style.url;
  } else {
    return style.url;
  }
}
function getShoppableItems(style){
  let crossSell = {};
  if(style.shoppableItems){
    console.log('LENGTH:',style.shoppableItems.length)
    style.shoppableItems.map(ss => {
      let article_type = constants.categoryMap[ss.title] || ss.title;
      if(!crossSell[article_type]){
        crossSell[article_type] = [];
      }
      crossSell[article_type] = [...crossSell[article_type], ...ss.crossSellStyleIds||[]]
    })
  }
  let shoppableItems = [];
  for(let key of Object.keys(crossSell)){
    shoppableItems.push({
      title: key,
      crossSellStyleIds: crossSell[key].sort(sortProducts).map(cs => cs.id),
      //attributes: []
    })
  }
  //shoppableItems = shoppableItems.slice(0,5);

  return shoppableItems;
}
//get attributes
function getAttributes(style){
  let attri = [];
  if(style.attributes){
    for(let i=0;i<style.attributes.length;i++){
      let item=style.attributes[i]
      attri.push({  
        title: item.title,
        textAttributes: item.textAttributes
      })
    }
  }
  return attri;
}
function sortProducts(p1,p2){
  if(p1.score < p2.score)
    return 1;
  else if(p1.score > p2.score)
    return -1;
  else
    return 0;
}
const getStreetStyleIdeas = async function(user){
  let styles;
 /*  if(user === "fk-tech"){
    styles = await StreetStyles.find({
      readyForFlipkart: true
    }).toArray();
  } else { */
    styles = await StreetStyles.find({
      readyforflipkart: true
    }).toArray();
  //}
  
  console.log("Styles ", styles.length)
  let streetStyles = styles.map(style => {
    let credit = style.credit ? style.credit : "";
    return {
      id: style.id,
      imageUrl: getStyleUrl(style),
      credit: credit,
      // shoppableItems: style.shoppableItems ? style.shoppableItems.map(ss => {
      // 	ss.crossSellStyleIds = ss.crossSellStyleIds.sort(sortProducts).map(cs => cs.id);
	    //   return ss;
      // }) : [],
      shoppableItems: getShoppableItems(style),
      //myntraImageUrl: "",
      attributes: getAttributes(style),
      isImageUpdated: style.isUpdated
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
