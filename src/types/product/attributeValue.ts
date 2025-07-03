export interface AttributeValue{
    id:string;
    attributeId:string;
    valueName:string;
    createdAt:Date;
    createdBy:string;
     lastModifiedAt:Date;
   lastModifiedBy:string;

}
export interface CreateAttributeValue{
    attributeId:string;
    valueName:string;
}