export interface DetailShopMembershipDTO {
  id: string
  shopID: string
  startDate: Date
  endDate: Date
  remainingLivestream: number
  status: string
  createdBy?: string
  createdAt: Date
  modifiedBy?: string
  modifiedAt?: Date
  isDeleted: boolean
  maxProduct?: number
  commission?: number
  name?: string | null
}

export interface ListShopMembershipDTO {
  totalItem: number
  detailShopMembership: DetailShopMembershipDTO[]
}

export interface FilterShopMembership {
  shopId: string
  membershipType?: string
  status?: string
  startDate?: Date
  endDate?: Date
  pageIndex?: number
  pageSize?: number
}
