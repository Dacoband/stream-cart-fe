export interface LoginRequest {
    username: string;
    password: string;
}
export interface User {
    id:string;
    username:string;
    email:string;
    phoneNumber:string;
    fullname:string;
    role:number;
    isActive:boolean;
    isVerified:boolean;
    completeRate:boolean;
    shopId:string;
    createdAt:string;
    lastModifiedAt:string;
    lastModifiedBy:string;


}
export type UserLocal = {
  token: string;
  userId: string;
  username: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
};

