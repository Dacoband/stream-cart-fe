export interface Membership {
  membershipId: string
  name: string
  type: string
  description: string
  price: number
  duration: number
  maxModerator: number
  maxLivestream: number
  commission: number
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
  isDeleted: boolean
}
export interface CreateMembership {
  name: string
  type: number
  description: string
  price?: number | undefined
  duration?: number | undefined
  maxModerator?: number | undefined
  maxLivestream?: number | undefined
  commission?: number | undefined
}

export enum SortByMembershipEnum {
  Name = 0,
  Price = 1,
}

export enum SortDirectionEnum {
  Asc = 0,
  Desc = 1,
}

export interface FilterMembershipDTO {
  type?: string
  fromPrice?: number
  toPrice?: number
  minDuration?: number
  maxProduct?: number
  maxLivestream?: number
  maxCommission?: number
  isDeleted?: boolean
  pageIndex?: number
  pageSize?: number
  sortBy?: SortByMembershipEnum
  sortDirection?: SortDirectionEnum
}

export interface DetailMembershipDTO {
  membershipId: string
  name: string
  type: string
  description: string
  price: number
  duration: number
  maxModerator: number
  maxLivestream: number
  commission: number
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
  isDeleted: boolean
}
