export interface Membership {
  membershipId: string;
  name: string;
  type: string;
  description: string;
  price: number;
  duration: number;
  maxModerator: number;
  maxLivestream: number;
  commission: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
}
export interface CreateMembership {
  name: string;
  type: number;
  description: string;
  price?: number | undefined;
  duration?: number | undefined;
  maxModerator?: number | undefined;
  maxLivestream?: number | undefined;
  commission?: number | undefined;
}
