const GRPC_SOURCE = {
  OK: "ok",
  FAILED: "failed",
  ERROR: "error"
}
const SuperCategory = {
  BOTTOMWEAR: "Bottomwear",
  TOPWEAR: "Topwear",
  DRESSES: "Dresses",
  OUTERWEAR: "Outerwear",
  FOOTWEAR: "Footwear",
  BAGS: "Bags",
  ACCESSORIES: "Accessories"
}
const categoryMap = {
  "Dresses": SuperCategory.DRESSES,
  "Skirts": SuperCategory.BOTTOMWEAR,
  "Tunics": SuperCategory.TOPWEAR,
  "Flats": SuperCategory.FOOTWEAR,
  "Heels": SuperCategory.FOOTWEAR,
  "Jeans": SuperCategory.BOTTOMWEAR,
  "Shirts": SuperCategory.TOPWEAR,
  "Tops": SuperCategory.TOPWEAR,
  "Trousers": SuperCategory.BOTTOMWEAR,
  "Tshirts": SuperCategory.TOPWEAR,
  "leggings": SuperCategory.BOTTOMWEAR,
  "Casual Shoes": SuperCategory.FOOTWEAR,
  "Sports Shoes": SuperCategory.FOOTWEAR,
  "Capris": SuperCategory.BOTTOMWEAR,
  "Tights": SuperCategory.BOTTOMWEAR,
  "Track Pants": SuperCategory.BOTTOMWEAR,
  "Bodysuit": SuperCategory.TOPWEAR,
  "Handbags": SuperCategory.BAGS,
  "Jackets": SuperCategory.OUTERWEAR,
  "Shorts": SuperCategory.BOTTOMWEAR,
  "Shrug": SuperCategory.OUTERWEAR,
  "Sweaters": SuperCategory.OUTERWEAR,
  "Sweatshirts": SuperCategory.OUTERWEAR,
  "Blazers": SuperCategory.OUTERWEAR,
  "Messenger Bag": SuperCategory.BAGS,
  "Coats": SuperCategory.OUTERWEAR,
  "Clutches": SuperCategory.BAGS,
  "Waistcoat": SuperCategory.OUTERWEAR,
  "Footwear": SuperCategory.FOOTWEAR,
  "Jeans and jaggings": SuperCategory.BOTTOMWEAR,
  "Bags": SuperCategory.BAGS,
  "Sunglasses": SuperCategory.ACCESSORIES
}

//check existing categories in shoppable items with this code 
// db.StreetStyles.distinct("shoppableItems.title")

// export default constants;

module.exports = {
  GRPC_SOURCE,
  categoryMap
}