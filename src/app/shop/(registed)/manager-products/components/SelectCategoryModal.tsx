"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Category } from "@/types/category/category";
import { getAllCategories } from "@/services/api/categories/categorys";
import { ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (category: Category) => void;
  initialSelectedCategoryId?: string | null;
}

const SelectCategoryModal: React.FC<Props> = ({
  open,
  onClose,
  onSelect,
  initialSelectedCategoryId,
}) => {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPath, setSelectedPath] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  const findCategoryPath = React.useCallback(
    (rootCategories: Category[], targetId: string): Category[] | null => {
      for (const cat of rootCategories) {
        if (cat.categoryId === targetId) return [cat];
        if (cat.subCategories?.length) {
          const subPath = findCategoryPath(cat.subCategories, targetId);
          if (subPath) return [cat, ...subPath];
        }
      }
      return null;
    },
    []
  );

  useEffect(() => {
    if (open) {
      setSearchTerm("");
      setSelectedPath([]);
      setSelectedCategory(null);

      fetchCategories().then((categories) => {
        if (initialSelectedCategoryId) {
          const path = findCategoryPath(categories, initialSelectedCategoryId);
          if (path) {
            setSelectedPath(path);
            setSelectedCategory(path[path.length - 1]);
          }
        }
      });
    }
  }, [open, initialSelectedCategoryId, findCategoryPath]);

  const fetchCategories = async (): Promise<Category[]> => {
    try {
      const res = await getAllCategories({ PageIndex: 1, PageSize: 200 });
      const categories = res.data?.categories || [];
      setAllCategories(categories);
      return categories;
    } catch (err) {
      console.error("Lỗi lấy danh mục:", err);
      setAllCategories([]);
      return [];
    }
  };
  const getChildren = (parent?: Category): Category[] => {
    if (!parent) {
      return allCategories;
    }
    return parent.subCategories || [];
  };

  const handleSelect = (level: number, category: Category) => {
    const newPath = [...selectedPath.slice(0, level), category];
    setSelectedPath(newPath);
    setSelectedCategory(category);
  };

  const filtered = (list: Category[]) =>
    list?.filter((cat) =>
      cat.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const levels = [undefined, ...selectedPath];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-w-[55vw]">
        <DialogTitle>Chọn ngành hàng</DialogTitle>
        <div className="bg-[#F5F5F5] p-4">
          <Input
            placeholder="Tìm kiếm ngành hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4 bg-white"
          />

          <div className="grid grid-cols-4 bg-white h-[45vh] overflow-auto">
            {levels.map((parent, idx) => {
              const list = filtered(getChildren(parent));
              return (
                <ScrollArea key={idx} className="border-r h-full w-full">
                  {list.length > 0
                    ? list.map((cat) => (
                        <Button
                          key={cat.categoryId}
                          onClick={() => handleSelect(idx, cat)}
                          variant="ghost"
                          className={`w-full rounded-none flex justify-between truncate  hover:bg-white hover:text-lime-600 font-normal mb-1 cursor-pointer 
                          ${
                            selectedPath[idx]?.categoryId === cat.categoryId
                              ? "bg-lime-100 text-lime-600 font-medium"
                              : ""
                          }`}
                        >
                          {cat.categoryName} <ChevronRight />
                        </Button>
                      ))
                    : null}
                </ScrollArea>
              );
            })}
          </div>
        </div>
        <div className="mt-4 px-4 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Danh mục đã chọn:{" "}
            {selectedCategory ? (
              <strong className="text-lime-600">
                {selectedCategory.categoryName}
              </strong>
            ) : (
              <div className="text-red-500">Chưa chọn</div>
            )}
          </span>
          <Button
            onClick={() => {
              if (selectedCategory) {
                onSelect(selectedCategory);
                onClose();
              }
            }}
            className="bg-lime-500 hover:bg-lime-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedCategory}
          >
            Xác nhận
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SelectCategoryModal;
