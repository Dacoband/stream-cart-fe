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
    completeRate:number;
    shopId:string;
    createdAt:string;
    lastModifiedAt:string;
    lastModifiedBy:string;
avatarURL:string;
registrationDate:Date;
lastLoginDate:Date;


}
export interface UserLocal{
 phoneNumber:string;
  fullname:string;
  id: string;
  username: string;
  role: number;
  isActive: boolean;
  isVerified: boolean;
  shopId:string;
  avatarURL:string;
  email:string;


};

export interface RegisterUser{
  username:string;
  email:string;
  password:string;
  phoneNumber:string;
  fullname:string;
  avatarURL:string;
  role:number;
}

export interface UpdateUser{
  phoneNumber:string;
  fullname:string;
  avatarURL:string|null;
  role:number;
isActive:boolean;
 isVerified:boolean;
shopId:string|null;
}
export interface CreateModerator{
  username:string;
  email:string;
  password:string|null;
  phoneNumber:string;
  fullname:boolean;
  avatarURL:string|null,
  
}
export interface Moderator{
  id:string;

  username:string;
  email:string;
  avatarURL:string|null,
  phoneNumber:string;
  fullname:boolean;
  role:number;
  registrationDate:Date;
  lastLoginDate:Date;
  isActive:boolean;
  isVerified:boolean;
  completeRate:number;
  shopId:string;
  createdAt:Date;
  createdBy:string;
  lastModifiedAt:string;
  lastModifieBy:string;
}