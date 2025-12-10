"use client";

import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Edit, Eye, Plus, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import {
  useGetAllCategoryQuery,
  useDeleteCategoryMutation,
} from "../../../redux/sellerApi/category/categoryApi";
import useToast from "../../../hooks/useShowToast";
import { getImageUrl } from "../../../redux/baseUrl";
import CategoryViewModal from "./CategoryViewModal";

const CategoryList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const {
    data: categoriesData,
    isLoading,
    error,
    refetch,
  } = useGetAllCategoryQuery();
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();

  // Extract categories from API response
  // Response structure: { success: true, data: { categorys: [...], meta: {...} } }
  const categories = Array.isArray(categoriesData?.data?.categorys)
    ? categoriesData.data.categorys
    : Array.isArray(categoriesData?.data)
    ? categoriesData.data
    : Array.isArray(categoriesData)
    ? categoriesData
    : [];

  const filteredCategories = useMemo(() => {
    // Ensure categories is an array before filtering
    if (!Array.isArray(categories)) {
      return [];
    }

    if (!searchTerm.trim()) {
      return categories;
    }

    const searchLower = searchTerm.toLowerCase();
    return categories.filter(
      (category) =>
        category?.name?.toLowerCase().includes(searchLower) ||
        category?.description?.toLowerCase().includes(searchLower)
    );
  }, [categories, searchTerm]);

  // Pagination logic
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

  const getImageSrc = (imagePath) => {
    if (!imagePath) return "/placeholder-image.png";
    if (imagePath.startsWith("http")) return imagePath;
    return `${getImageUrl}${
      imagePath.startsWith("/") ? imagePath : `/${imagePath}`
    }`;
  };

  const handleView = (category) => {
    setSelectedCategory(category);
    setIsViewModalOpen(true);
  };

  const handleEdit = (category) => {
    router.push(
      `/seller/category/add-category?id=${encodeURIComponent(category._id)}`
    );
  };

  const handleDelete = async (category) => {
    if (
      !confirm(`Are you sure you want to delete category "${category.name}"?`)
    ) {
      return;
    }

    try {
      const response = await deleteCategory(category._id).unwrap();
      if (response?.success) {
        toast.showSuccess("Category deleted successfully!");
        refetch();
      } else {
        toast.showError(response?.message || "Failed to delete category");
      }
    } catch (error) {
      console.error("Delete category error:", error);
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to delete category. Please try again.";
      toast.showError(errorMessage);
    }
  };

  return (
    <div className="">
      <div className="">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Category List</h1>

        {/* Card Container */}
        <Card className="shadow-sm p-0">
          <CardContent className="p-5">
            {/* Top Bar */}
            <div className="flex pb-4 justify-between items-center border-b border-gray-200">
              <Button
                onClick={() => router.push("/seller/category/add-category")}
                className="bg-red-700 hover:bg-red-800 text-white"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Category
              </Button>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="text-center py-8">Loading categories...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-600">
                  Error loading categories:{" "}
                  {error?.data?.message || error?.message || "Unknown error"}
                  <div className="text-xs mt-2 text-gray-500">
                    Please check your connection and try again.
                  </div>
                </div>
              ) : !Array.isArray(filteredCategories) ? (
                <div className="text-center py-8 text-red-600">
                  Invalid data format received from server.
                  <div className="text-xs mt-2 text-gray-500">
                    Expected array but got: {typeof filteredCategories}
                  </div>
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm
                    ? "No categories found matching your search"
                    : "No categories found. Click 'Add Category' to create one."}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-200 hover:bg-gray-200">
                      <TableHead className="font-semibold text-gray-900">
                        Name
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900">
                        Image
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900">
                        Description
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900">
                        Subcategories
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900">
                        Status
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(paginatedCategories) &&
                      paginatedCategories.map((category) => (
                        <TableRow key={category?._id || Math.random()}>
                          <TableCell className="text-gray-900 font-medium">
                            {category?.name || "N/A"}
                          </TableCell>
                          <TableCell>
                            <div className="w-16 h-16 rounded-md overflow-hidden">
                              <img
                                src={getImageSrc(
                                  category?.thumbnail || category?.image
                                )}
                                alt={category?.name || "Category"}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-900 max-w-xs">
                            <p className="truncate">
                              {category?.description || "N/A"}
                            </p>
                          </TableCell>
                          <TableCell className="text-gray-900">
                            {Array.isArray(category?.subCategory)
                              ? category.subCategory.length
                              : category?.subCategory?.length || 0}
                          </TableCell>
                          <TableCell className="text-gray-900">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                category?.status === "active" ||
                                category?.isActive !== false
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {category?.status === "active" ||
                              category?.isActive !== false
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleView(category)}
                                className="border-orange-400 text-orange-500 h-10 w-10 hover:bg-orange-50 hover:text-orange-600"
                                disabled={isDeleting}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEdit(category)}
                                className="border-green-400 text-green-500 h-10 w-10 hover:bg-green-50 hover:text-green-600"
                                disabled={isDeleting}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDelete(category)}
                                className="border-red-400 text-red-500 h-10 w-10 hover:bg-red-50 hover:text-red-600"
                                disabled={isDeleting}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Pagination */}
            {filteredCategories.length > 0 && (
              <div className="p-6 border-t border-gray-200 flex justify-end items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Prev
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      onClick={() => setCurrentPage(pageNum)}
                      className={
                        currentPage === pageNum
                          ? "bg-red-700 hover:bg-red-800"
                          : ""
                      }
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="px-2">...</span>
                    <Button
                      variant={
                        currentPage === totalPages ? "default" : "outline"
                      }
                      onClick={() => setCurrentPage(totalPages)}
                      className={
                        currentPage === totalPages
                          ? "bg-red-700 hover:bg-red-800"
                          : ""
                      }
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Modal */}
      <CategoryViewModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        category={selectedCategory}
      />
    </div>
  );
};

export default CategoryList;
