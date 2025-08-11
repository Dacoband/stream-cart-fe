export interface Shop {
  id: string
  shopName: string
  description: string
  logoURL: string
  coverImageURL: string
  ratingAverage: number
  totalAverage: number
  registrationDate: Date
  approvalStatus: string
  approvalDate: Date
  bankAccountNumber: string
  bankName: string
  taxNumber: string
  totalProduct: number
  completeRate: number
  status: boolean
  accountId: string
  createdBy: string
  createdAt: Date
  lastModifiedAt: Date
  lastModifiedBy: string
}
export interface RegisterShop {
  shopName: string
  description: string
  logoURL: string
  coverImageURL: string
  street:string
  ward:string
  district:string
  city:string
  country:string
  postalCode:string;
  phoneNumber:string;
  bankName: string,
  bankNumber: string,
  tax: string
}



export interface FilterShop {
  pageNumber: number
  pageSize: number
  status: string
  approvalStatus: string
  searchTerm: string
  sortBy: string
  ascending: boolean
}

export interface ListShop {
  currentPage: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPrevious: boolean
  hasNext: boolean
  items: Shop[]
}
