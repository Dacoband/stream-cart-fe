export interface Category {
  categoryId: string
  categoryName: string
  description: string
  iconURL: string
  slug: string
  isDeleted: boolean
  subCategories?: Category[]
  // fix deployce
    parentCategoryID?: string | null
}export interface listCategory {
  totalItem: number
  categories: Category[]
}

export interface filterCategory {
  CategoryName?: string
  PageIndex?: number
  PageSize?: number
  IsDeleted?: boolean | null
  ParentCategoryID?: string | null
}

export interface createCategory {
  categoryName: string
  description?: string
  iconURL?: string
  slug?: string
  parentCategoryID?: string | null
}

