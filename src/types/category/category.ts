export interface Category {
  categoryId: string
  categoryName: string
  description: string
  iconURL: string
  slug: string
  subCategories?: Category[]
}
export interface filterCategory {
  CategoryName?: string
  PageIndex?: number
  PageSize?: number
  // IsDeleted?: boolean | null
}
