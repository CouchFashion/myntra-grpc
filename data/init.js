const InitModule = require("../GRPC/server/InitModule");
const products = require("./recommendations.json");
const styles = require("./streetStyles.json");
const initObject = new InitModule();
let dbObject, MyntraProducts, StreetStyles;

async function init() {
  await initObject.getMongoDB()
  .then(dbo => {
    dbObject = dbo;
    MyntraProducts = dbObject.collection("myntra_products_demo");
    StreetStyles = dbObject.collection("streetStyles_demo");
  })
  .catch(e => {
    console.log("Mongo Connection Failed", e);
  });
  let demo_products = Object.entries(products).map(([key, value]) => {
    console.log(value)
    return {
      product_id: key,
      reviewed: true,
      readyForMyntra: true,
      mapped_images: value.map(id => {
        return {
          checked: true,
          name: id,
          source: "MarkableAI"
        }
      })
    }
  })
  console.log(JSON.stringify(demo_products));
  await MyntraProducts.insert(demo_products);
  let demo_styles = Object.entries(styles).map( ([id, value]) => {
    return {
      id: value.id,
      globalUrl: value.imageUrl,
      credit: value.credit,
      readyForMyntra: true,
      shoppableItems: value.shoppableItems
    };
  })
  console.log(JSON.stringify(demo_styles))
  await StreetStyles.insert(demo_styles);
  console.log("Done")
}
init();