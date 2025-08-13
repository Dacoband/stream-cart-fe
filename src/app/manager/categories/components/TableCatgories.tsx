"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  Search,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

import React, { useEffect, useState } from "react";
import { Category } from "@/types/category/category";
import {
  deleteCategory,
  getDetailCategory,
} from "@/services/api/categories/categorys";
import { toast } from "sonner";
import SubcategoryItem from "./SubcategoryItem";
import CategoryDetailModal from "./CategoryDetailModal";
import CreateCategoryModal from "./CreateCategoryModal";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Props = {
  categories: Category[];
  loading: boolean;
  page: number;
  setPage: (p: number) => void;
  totalPages: number;
  onSearch: (val: string) => void;
  onRefresh: () => void;
  statusFilter: boolean | null;
  setStatusFilter: (val: boolean | null) => void;
};

const TableCatgories: React.FC<Props> = ({
  categories,
  // loading,
  // page,
  // setPage,
  // totalPages,
  onSearch,
  onRefresh,
  statusFilter,
  setStatusFilter,
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{
    id: string;
    name: string;
    isDeleted: boolean;
  } | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailCategory, setDetailCategory] = useState<Category | null>(null);
  // const [loadingDetail, setLoadingDetail] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedParentCategory, setSelectedParentCategory] =
    useState<Category | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedCategoryForUpdate, setSelectedCategoryForUpdate] =
    useState<Category | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearch(searchValue);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchValue]);

  const handleViewDetail = async (categoryId: string) => {
    setLoadingDetail(true);
    try {
      const detail = await getDetailCategory(categoryId);
      console.log(detail);
      setDetailCategory(detail.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error loading category detail:", error);
      toast.error(
        "Không thể tải thông tin chi tiết danh mục. Vui lòng thử lại!"
      );
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDetailModalClose = () => {
    setShowDetailModal(false);
    setDetailCategory(null);
  };

  const handleAddSubcategory = (parentCategory: Category) => {
    setSelectedParentCategory(parentCategory);
    setShowCreateModal(true);
  };

  const handleCreateModalClose = () => {
    setShowCreateModal(false);
    setSelectedParentCategory(null);
  };

  const handleUpdateCategory = (category: Category) => {
    setSelectedCategoryForUpdate(category);
    setShowUpdateModal(true);
  };

  const handleUpdateModalClose = () => {
    setShowUpdateModal(false);
    setSelectedCategoryForUpdate(null);
  };

  const handleDeleteCategory = (
    categoryId: string,
    categoryName: string,
    isDeleted: boolean
  ) => {
    setSelectedCategory({
      id: categoryId,
      name: categoryName,
      isDeleted: isDeleted,
    });
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedCategory) return;

    const action = selectedCategory.isDeleted ? "khôi phục" : "xóa";
    const actionText = selectedCategory.isDeleted ? "Khôi phục" : "Xóa";

    try {
      await deleteCategory(selectedCategory.id);
      toast.success(
        `${actionText} danh mục "${selectedCategory.name}" thành công!`
      );
      onRefresh(); // Refresh the data after successful action
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(`Không thể ${action} danh mục. Vui lòng thử lại!`);
    } finally {
      setShowConfirmModal(false);
      setSelectedCategory(null);
    }
  };

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedItems(newExpanded);
  };

  const hasSubcategories = (category: Category) => {
    return category.subCategories && category.subCategories.length > 0;
  };

  const getSubcategories = (categoryId: string) => {
    const category = categories.find((c) => c.categoryId === categoryId);
    return category?.subCategories || [];
  };

  return (
    <>
      <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedCategory?.isDeleted
                ? "Khôi phục danh mục"
                : "Xóa danh mục"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn{" "}
              {selectedCategory?.isDeleted ? "khôi phục" : "xóa"} danh mục{" "}
              {selectedCategory?.name} không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {selectedCategory?.isDeleted ? "Khôi phục" : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Category Detail Modal */}
      <CategoryDetailModal
        category={detailCategory}
        open={showDetailModal}
        onOpenChange={handleDetailModalClose}
        onRefresh={onRefresh}
      />

      {/* Create Category Modal */}
      <CreateCategoryModal
        open={showCreateModal}
        onOpenChange={handleCreateModalClose}
        onSuccess={onRefresh}
        parentCategoryID={selectedParentCategory?.categoryId || ""}
      />

      {/* Update Category Modal */}
      <CreateCategoryModal
        open={showUpdateModal}
        onOpenChange={handleUpdateModalClose}
        onSuccess={onRefresh}
        mode="update"
        initialData={selectedCategoryForUpdate}
      />

      <Card className="bg-white py-5 px-8">
        <div className="flex items-center gap-3 py-4">
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Search className="text-gray-600" />
              </span>
              <Input
                placeholder="Tìm kiếm tên danh mục..."
                className="max-w-full pl-12"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="min-w-[160px] justify-between cursor-pointer"
                >
                  {statusFilter === null
                    ? "Tất cả danh mục"
                    : statusFilter === false
                    ? "Đang hoạt động"
                    : "Đã xóa"}
                  <ChevronDown className="ml-2 w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                  Tất cả danh mục
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter(false)}>
                  Đang hoạt động
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter(true)}>
                  Đã xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="w-full">
          <Table className="border-t border-gray-200">
            <TableHeader className="bg-[#B0F847]/50">
              <TableRow>
                <TableHead className="w-[50%] text-base py-4 font-medium px-5">
                  Tên danh mục
                </TableHead>
                <TableHead className="text-center text-base font-medium px-5">
                  Icon
                </TableHead>
                <TableHead className="text-center text-base font-medium px-5">
                  Trạng thái
                </TableHead>
                <TableHead className="text-center text-base font-medium w-[1%] whitespace-nowrap px-5">
                  Hành động
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingDetail ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={`sk-${i}`}>
                    <TableCell className="px-5">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-5 w-40" />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Skeleton className="h-10 w-10 rounded" />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-6 w-24 mx-auto rounded-full" />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <div className="flex flex-col items-center justify-center py-10">
                      <Image
                        src="/assets/nodata.png"
                        alt="No data"
                        width={300}
                        height={200}
                        className="mb-4"
                      />
                      <p className="text-gray-500 text-base">
                        Không có danh mục nào
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((c) => [
                  <TableRow
                    key={c.categoryId}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleViewDetail(c.categoryId)}
                  >
                    <TableCell className="text-base py-4 align-middle px-5">
                      <div className="flex items-center gap-2">
                        {hasSubcategories(c) ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpanded(c.categoryId);
                            }}
                            className="p-1 h-4 w-4"
                          >
                            {expandedItems.has(c.categoryId) ? (
                              <ChevronDown className="w-2 h-3" />
                            ) : (
                              <ChevronRight className="w-2 h-2" />
                            )}
                          </Button>
                        ) : (
                          <div className="w-4 h-4"></div>
                        )}
                        <span className="font-medium">{c.categoryName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center align-middle px-5">
                      <div className="flex items-center justify-center">
                        <Image
                          src={c.iconURL}
                          alt={c.categoryName}
                          width={40}
                          height={40}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center align-middle px-5">
                      {c.isDeleted ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                          Đã xóa
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-600">
                          Đang hoạt động
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center align-middle w-[1%] whitespace-nowrap px-5">
                      <div className="flex items-center justify-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleViewDetail(c.categoryId)}
                            >
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateCategory(c)}
                            >
                              Chỉnh sửa
                            </DropdownMenuItem>
                            {!c.isDeleted && (
                              <DropdownMenuItem
                                onClick={() => handleAddSubcategory(c)}
                              >
                                Thêm danh mục con
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {c.isDeleted ? (
                              <DropdownMenuItem
                                className="text-red-500"
                                onClick={() =>
                                  handleDeleteCategory(
                                    c.categoryId,
                                    c.categoryName,
                                    c.isDeleted
                                  )
                                }
                              >
                                Khôi phục
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="text-red-500"
                                onClick={() =>
                                  handleDeleteCategory(
                                    c.categoryId,
                                    c.categoryName,
                                    c.isDeleted
                                  )
                                }
                              >
                                Xóa
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>,
                  expandedItems.has(c.categoryId) &&
                  getSubcategories(c.categoryId).length === 0 ? (
                    <TableRow key={`sub-${c.categoryId}`}>
                      <TableCell colSpan={4}>
                        <div className="flex items-center justify-center py-4">
                          <div className="text-gray-500 text-sm">
                            Không có danh mục con
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    expandedItems.has(c.categoryId) &&
                    getSubcategories(c.categoryId).map((subCategory) => (
                      <SubcategoryItem
                        key={subCategory.categoryId}
                        subCategory={subCategory}
                        onDeleteCategory={handleDeleteCategory}
                        onViewDetail={handleViewDetail}
                        onAddSubcategory={handleAddSubcategory}
                        onUpdateCategory={handleUpdateCategory}
                      />
                    ))
                  ),
                ])
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </>
  );
};

export default TableCatgories;
