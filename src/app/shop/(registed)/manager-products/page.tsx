"use client";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CirclePlus,
  Edit,
  MoreVertical,
  PenLineIcon,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import {
  getProductHasFilter,
  getProductDetailById,
  deleteProductById,
} from "@/services/api/product/product";
import { Product, ProductDetail } from "@/types/product/product";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/AuthContext";
import { getCategoryById } from "@/services/api/categories/categorys";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PriceTag from "@/components/common/PriceTag";
import AlertDelete from "./components/AlertDelete";
import DialogUpdateStock from "./components/DialogUpdateStock";
import { toast } from "sonner";

function Page() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<number>(5);
  const [status, setStatus] = useState<"true" | "false">("true");
  const [stock, setStock] = useState<"all" | "true" | "false">("all");
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>(
    {}
  );
  const [productVariants, setProductVariants] = useState<
    Record<string, ProductDetail>
  >({});
  const [confirmDeleteProduct, setConfirmDeleteProduct] =
    useState<Product | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [editStockProduct, setEditStockProduct] = useState<Product | null>(
    null
  );
  const [editStockDetail, setEditStockDetail] = useState<
    ProductDetail | undefined
  >(undefined);

  const fetchProducts = React.useCallback(async () => {
    setLoading(true);
    if (!user?.shopId) {
      setProducts([]);
      setLoading(false);
      return;
    }
    const activeOnly = status === "true" ? true : false;
    const instockOnly =
      stock === "all" ? undefined : stock === "true" ? true : false;
    try {
      const res = await getProductHasFilter({
        pageNumber: page,
        pageSize: 8,
        sortOption: sort,
        activeOnly,
        InstockOnly: instockOnly,
        shopId: user.shopId,
      });
      setProducts(res?.data?.items ?? []);
      setTotalPages(res?.data?.totalPages ?? 1);
    } catch {
      setProducts([]);
    }
    setLoading(false);
  }, [user?.shopId, status, stock, sort, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const fetchCategories = async () => {
      const uniqueCategoryIds = Array.from(
        new Set(products.map((p) => p.categoryId))
      );
      const newCategoryNames: Record<string, string> = {};

      await Promise.all(
        uniqueCategoryIds.map(async (id) => {
          if (!id) return;
          try {
            const res = await getCategoryById(id);
            newCategoryNames[id] = res?.categoryName ?? "Không xác định";
          } catch {
            newCategoryNames[id] = "Không xác định";
          }
        })
      );

      setCategoryNames(newCategoryNames);
    };

    if (products.length > 0) {
      fetchCategories();
    }
  }, [products]);
  useEffect(() => {
    const fetchVariants = async () => {
      const variantMap: Record<string, ProductDetail> = {};
      await Promise.all(
        products
          .filter((product) => product.hasVariant)
          .map(async (product) => {
            try {
              const res = await getProductDetailById(product.id);
              variantMap[product.id] = res;
            } catch {
              // fallback nếu lỗi
            }
          })
      );
      setProductVariants(variantMap);
    };

    if (products.length > 0) fetchVariants();
  }, [products]);

  const filteredProducts = products.filter(
    (p) =>
      p.productName
        ?.normalize("NFD")
        .toLowerCase()
        .includes(search.normalize("NFD").toLowerCase()) ||
      p.sku
        ?.normalize("NFD")
        .toLowerCase()
        .includes(search.normalize("NFD").toLowerCase())
  );

  const handleConfirmDelete = async () => {
    if (!confirmDeleteProduct) return;
    try {
      setLoadingDelete(true);
      await deleteProductById(confirmDeleteProduct.id);
      toast.success("Đã ngừng bán sản phẩm thành công");
      setConfirmDeleteProduct(null);
      fetchProducts();
    } catch (error) {
      console.error("Fetch Error delete products:", error);
      toast.error("Xóa sản phẩm thất bại");
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-5 min-h-full">
        <div className="bg-white sticky top-0 z-10 h-fit w-full py-4 px-8 shadow flex justify-between items-center">
          <h2 className="text-xl font-bold">Danh sách sản phẩm</h2>
          <Link href="/shop/manager-products/new-product">
            <Button className="bg-[#B0F847] text-black shadow flex gap-2 py-2 px-4 text-base cursor-pointer hover:bg-[#B0F847]/80 hover:text-black/80">
              <CirclePlus />
              Thêm sản phẩm
            </Button>
          </Link>
        </div>
        <div className="mx-5 mb-10">
          <Card className="bg-white py-5 px-8 min-h-[75vh]">
            <div className="flex items-center gap-3 py-4">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Search className="text-gray-600" />
                </span>

                <Input
                  placeholder="Tìm kiếm tên sản phẩm hoặc SKU..."
                  className="w-full  pl-12 pr-10 py-5"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="w-[180px]">
                <Select
                  value={status}
                  onValueChange={(value) =>
                    setStatus(value as "true" | "false")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Tất cả sản phẩm</SelectItem>
                    <SelectItem value="false">Đang hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-[150px]">
                <Select
                  value={stock}
                  onValueChange={(value) =>
                    setStock(value as "all" | "true" | "false")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Kho hàng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Kho hàng</SelectItem>
                    <SelectItem value="true">Còn hàng</SelectItem>
                    <SelectItem value="false">Hết hàng</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-[180px]">
                <Select
                  value={sort.toString()}
                  onValueChange={(value) => setSort(Number(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sắp xếp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">Giá tăng dần</SelectItem>
                    <SelectItem value="3">Giá giảm dần</SelectItem>
                    <SelectItem value="6">Bán chạy</SelectItem>
                    <SelectItem value="4">Lâu nhất</SelectItem>
                    <SelectItem value="5">Mới nhất</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                className="border-blue-500 text-blue-500 cursor-pointer hover:text-blue-400 hover:bg-white hover:border-blue-400"
                onClick={() => {
                  setSearch("");
                  setStatus("true");
                  setSort(4);
                  setStock("all");
                }}
              >
                Đặt lại
              </Button>
            </div>

            <div className="w-full">
              <Table>
                <TableHeader className="bg-[#B0F847]/50">
                  <TableRow>
                    <TableHead className="font-semibold pl-6">
                      Sản phẩm
                    </TableHead>
                    <TableHead className="font-semibold ">Danh mục</TableHead>
                    <TableHead className="font-semibold ">Doanh thu</TableHead>

                    <TableHead className="font-semibold">Giá</TableHead>
                    <TableHead className="font-semibold">Kho hàng</TableHead>
                    <TableHead className="font-semibold">Trạng thái</TableHead>
                    <TableHead className="font-semibold text-right w-24 pr-6">
                      Thao tác
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    if (loading) {
                      return Array.from({ length: 3 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell className="flex gap-2">
                            <Skeleton className="h-20 w-20" />
                            <div>
                              <Skeleton className="h-4 w-48 mb-2" />
                              <Skeleton className="h-4 w-48" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-28" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell className="text-right">
                            <Skeleton className="h-4 w-20 ml-auto" />
                          </TableCell>
                        </TableRow>
                      ));
                    }
                    if (products.length === 0) {
                      return (
                        <TableRow>
                          <TableCell colSpan={7}>
                            <div>
                              <Image
                                src="/assets/emptydata.png"
                                alt="No data"
                                width={180}
                                height={200}
                                className="mt-14 mx-auto"
                              />
                              <div className="text-center mt-4 text-xl text-lime-700/60  font-medium">
                                Hiện chưa có sản phẩm nào
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    }
                    return filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="pl-5 w-[400px]">
                          <div className="flex items-start gap-4  h-24 py-2">
                            <Image
                              src={
                                product.primaryImageUrl ||
                                "/assets/emptydata.png"
                              }
                              height={80}
                              width={80}
                              alt={product.productName}
                              className="w-20 h-20 object-cover rounded"
                            />
                            <div>
                              <p className="font-semibold text-base text-gray-900 line-clamp-2 break-words whitespace-normal max-w-[305px]">
                                {product.productName}
                              </p>

                              <p className="!text-xs mt-2 text-gray-500">
                                SKU: {product.sku}
                              </p>
                            </div>
                          </div>
                          {productVariants[product.id]?.variants?.length >
                            0 && (
                            <div className="ml-24 text-sm space-y-1  w-full h-full">
                              {productVariants[product.id].variants.map(
                                (variant, idx) => (
                                  <div
                                    key={variant.variantId || idx}
                                    className="flex gap-5"
                                  >
                                    <div className="font-medium text-gray-500">
                                      Phân loại:
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {Object.entries(
                                        variant.attributeValues
                                      ).map(([attr, val]) => (
                                        <span key={attr + val} className=" ">
                                          {attr}: {val}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="flex items-start h-full w-full  ">
                          <div className=" text-lime-600 font-medium h-24 py-2">
                            {categoryNames[product.categoryId] ?? "Đang tải..."}
                          </div>
                          <div className="flex-1"></div>
                        </TableCell>
                        <TableCell className="align-top ">
                          <div className="h-24 py-2 text-base">
                            {product.quantitySold}
                          </div>
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="h-24 py-2">
                            <span className="font-semibold text-rose-600 text-base">
                              {product.discountPrice > 0 ? (
                                <div className="flex gap-2">
                                  <PriceTag value={product.finalPrice} />
                                  <div>-</div>
                                  <PriceTag
                                    value={product.basePrice}
                                    className="line-through ml-2 text-gray-500"
                                  />
                                </div>
                              ) : (
                                <PriceTag value={product.basePrice} />
                              )}
                            </span>
                          </div>
                          {productVariants[product.id]?.variants?.length >
                            0 && (
                            <div className="mt-1 text-sm font-semibold  space-y-1 text-gray-500 w-full h-full">
                              {productVariants[product.id].variants.map(
                                (variant, idx) => (
                                  <div
                                    key={variant.variantId || idx}
                                    className="flex flex-wrap gap-2"
                                  >
                                    <PriceTag value={variant.price} />
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="align-top ">
                          <div className="flex gap-8 ">
                            <div>
                              <div className="h-24 py-2 text-base">
                                {product.stockQuantity}
                              </div>
                              {productVariants[product.id]?.variants?.length >
                                0 && (
                                <div className="mt-1 text-sm  space-y-1 w-full text-gray-600 h-full">
                                  {productVariants[product.id].variants.map(
                                    (variant, idx) => (
                                      <div
                                        key={variant.variantId || idx}
                                        className="flex flex-wrap gap-2"
                                      >
                                        {variant.stock}
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              className="h-24 py-2 text-blue-600 hover:text-black flex justify-start cursor-pointer"
                              onClick={() => {
                                setEditStockProduct(product);
                                setEditStockDetail(productVariants[product.id]);
                              }}
                              aria-label="Chỉnh sửa kho"
                            >
                              <PenLineIcon size={20} />
                            </button>
                          </div>
                        </TableCell>

                        <TableCell className="align-top ">
                          <div className="flex w-full  justify-start h-24 py-2 items-start">
                            <span
                              className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-sm font-medium ${
                                product.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  product.isActive
                                    ? "bg-green-600"
                                    : "bg-red-600"
                                }`}
                              ></span>
                              {product.isActive ? "Đang bán" : "Ngừng bán"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-5">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="cursor-pointer"
                              >
                                <MoreVertical size={25} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-blue-600 flex justify-start cursor-pointer"
                                onClick={() =>
                                  router.push(
                                    `/shop/manager-products/${product.id}`
                                  )
                                }
                              >
                                <Edit size={18} className="mr-2" />
                                Cập nhật
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-500 cursor-pointer"
                                onClick={() => setConfirmDeleteProduct(product)}
                              >
                                <Trash2
                                  size={18}
                                  className="text-red-500 mr-2"
                                />
                                Ngừng bán
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ));
                  })()}
                </TableBody>
              </Table>
            </div>
            {totalPages && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem className="cursor-pointer">
                    <PaginationPrevious
                      onClick={() => {
                        if (page !== 1) setPage((p) => Math.max(1, p - 1));
                      }}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <PaginationItem key={idx} className=" cursor-pointer">
                      <PaginationLink
                        isActive={page === idx + 1}
                        onClick={() => setPage(idx + 1)}
                      >
                        {idx + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem className="cursor-pointer">
                    <PaginationNext
                      onClick={() => {
                        if (page !== totalPages)
                          setPage((p) => Math.min(totalPages, p + 1));
                      }}
                    ></PaginationNext>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </Card>
        </div>
      </div>
      <AlertDelete
        open={!!confirmDeleteProduct}
        product={confirmDeleteProduct}
        loading={loadingDelete}
        onCancel={() => setConfirmDeleteProduct(null)}
        onConfirm={handleConfirmDelete}
      />
      <DialogUpdateStock
        open={!!editStockProduct}
        product={editStockProduct}
        detail={editStockDetail}
        onClose={() => {
          setEditStockProduct(null);
          setEditStockDetail(undefined);
        }}
        onUpdated={() => {
          // refresh products and variants
          fetchProducts();
        }}
      />
    </>
  );
}

export default Page;
