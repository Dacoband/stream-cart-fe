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
  token: string;
  userId: string;
  username: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
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

