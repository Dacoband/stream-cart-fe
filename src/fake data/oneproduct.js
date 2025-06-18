



export const product = {
  ProductID: productID,
  ProductName: "Gấu Bông",
  Description: "Gấu bông mềm mại, dễ thương",
  SKU: "GB2024",
  CategoryID: uuidv4(),
  BasePrice: 200000,
  DiscountPrice: 180000,
  StockQuantity: 100,
  IsActive: true,
  CreationDate: new Date(),
  LastUpdateDate: new Date(),
  Weight: 0.5,
  Dimensions: "20x20x30 cm",
  HasVariant: true,
  QuantitySold: 0,
  ShopID: uuidv4()
};

export const productAttributes = [
  { AttributeID: sizeAttrID, Name: "Size" },
  { AttributeID: colorAttrID, Name: "Color" },
];

export const attributeValues = [
  { AttributeValueID: sizeS, AttributeID: sizeAttrID, ValueName: "S" },
  { AttributeValueID: sizeM, AttributeID: sizeAttrID, ValueName: "M" },
  { AttributeValueID: colorBrown, AttributeID: colorAttrID, ValueName: "Brown" },
  { AttributeValueID: colorPink, AttributeID: colorAttrID, ValueName: "Pink" },
];

export const productVariants = [
  {
    VariantID: variant1,
    ProductID: productID,
    SKU: "GB-S-BROWN",
    Price: 200000,
    FlashSalePrice: 180000,
    Stock: 20,
  },
  {
    VariantID: variant2,
    ProductID: productID,
    SKU: "GB-M-BROWN",
    Price: 210000,
    FlashSalePrice: 190000,
    Stock: 25,
  },
  {
    VariantID: variant3,
    ProductID: productID,
    SKU: "GB-S-PINK",
    Price: 200000,
    FlashSalePrice: 180000,
    Stock: 30,
  },
  {
    VariantID: variant4,
    ProductID: productID,
    SKU: "GB-M-PINK",
    Price: 210000,
    FlashSalePrice: 190000,
    Stock: 25,
  },
];

export const productCombinations = [
  { VariantID: variant1, AttributeValueID: sizeS },
  { VariantID: variant1, AttributeValueID: colorBrown },
  { VariantID: variant2, AttributeValueID: sizeM },
  { VariantID: variant2, AttributeValueID: colorBrown },
  { VariantID: variant3, AttributeValueID: sizeS },
  { VariantID: variant3, AttributeValueID: colorPink },
  { VariantID: variant4, AttributeValueID: sizeM },
  { VariantID: variant4, AttributeValueID: colorPink },
];

export const productImages = [
  {
    ImageID: uuidv4(),
    ProductID: productID,
    VariantID: variant1,
    ImageUrl: "https://example.com/bear-s-brown.jpg",
    IsPrimary: true,
    SortOrder: 1,
    AltText: "Gấu bông Size S màu nâu",
  },
  {
    ImageID: uuidv4(),
    ProductID: productID,
    VariantID: variant3,
    ImageUrl: "https://example.com/bear-s-pink.jpg",
    IsPrimary: true,
    SortOrder: 1,
    AltText: "Gấu bông Size S màu hồng",
  },
  {
    ImageID: uuidv4(),
    ProductID: productID,
    VariantID: variant2,
    ImageUrl: "https://example.com/bear-m-brown.jpg",
    IsPrimary: true,
    SortOrder: 1,
    AltText: "Gấu bông Size M màu nâu",
  },
  {
    ImageID: uuidv4(),
    ProductID: productID,
    VariantID: variant4,
    ImageUrl: "https://example.com/bear-m-pink.jpg",
    IsPrimary: true,
    SortOrder: 1,
    AltText: "Gấu bông Size M màu hồng",
  },
];
