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
  useGetAllBrandQuery,
  useDeleteCategoryMutation,
} from "../../../redux/sellerApi/brand/brandApi";
import useToast from "../../../hooks/useShowToast";
import { getImageUrl } from "../../../redux/baseUrl";
import BrandViewModal from "./BrandViewModal";

const BrandList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const { data: brandsData, isLoading, error, refetch } = useGetAllBrandQuery();
  const [deleteBrand, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  // Extract brands from API response
  // Response structure: { success: true, data: { result: [...], meta: {...} } }
  const brands = Array.isArray(brandsData?.data?.result)
    ? brandsData.data.result
    : Array.isArray(brandsData?.data)
    ? brandsData.data
    : Array.isArray(brandsData)
    ? brandsData
    : [];

  const filteredBrands = useMemo(() => {
    // Ensure brands is an array before filtering
    if (!Array.isArray(brands)) {
      return [];
    }

    if (!searchTerm.trim()) {
      return brands;
    }

    const searchLower = searchTerm.toLowerCase();
    return brands.filter((brand) =>
      brand?.name?.toLowerCase().includes(searchLower)
    );
  }, [brands, searchTerm]);

  // Pagination logic
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBrands = filteredBrands.slice(startIndex, endIndex);

  const getImageSrc = (imagePath) => {
    if (!imagePath) return "/placeholder-image.png";
    if (imagePath.startsWith("http")) return imagePath;
    return `${getImageUrl}${
      imagePath.startsWith("/") ? imagePath : `/${imagePath}`
    }`;
  };

  const handleView = (brand) => {
    setSelectedBrand(brand);
    setIsViewModalOpen(true);
  };

  const handleEdit = (brand) => {
    router.push(`/seller/brand/add-brand?id=${encodeURIComponent(brand._id)}`);
  };

  const handleDelete = async (brand) => {
    if (!confirm(`Are you sure you want to delete brand "${brand.name}"?`)) {
      return;
    }

    try {
      const response = await deleteBrand(brand._id).unwrap();
      if (response?.success) {
        toast.showSuccess("Brand deleted successfully!");
        refetch();
      } else {
        toast.showError(response?.message || "Failed to delete brand");
      }
    } catch (error) {
      console.error("Delete brand error:", error);
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to delete brand. Please try again.";
      toast.showError(errorMessage);
    }
  };

  return (
    <div className="">
      <div className="">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Brand List</h1>

        {/* Card Container */}
        <Card className="shadow-sm p-0">
          <CardContent className="p-5">
            {/* Top Bar */}
            <div className="flex pb-4 justify-between items-center border-b border-gray-200">
              <Button
                onClick={() => router.push("/seller/brand/add-brand")}
                className="bg-red-700 hover:bg-red-800 text-white"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Brand
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
                <div className="text-center py-8">Loading brands...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-600">
                  Error loading brands:{" "}
                  {error?.data?.message || error?.message || "Unknown error"}
                  <div className="text-xs mt-2 text-gray-500">
                    Please check your connection and try again.
                  </div>
                </div>
              ) : !Array.isArray(filteredBrands) ? (
                <div className="text-center py-8 text-red-600">
                  Invalid data format received from server.
                  <div className="text-xs mt-2 text-gray-500">
                    Expected array but got: {typeof filteredBrands}
                  </div>
                </div>
              ) : filteredBrands.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm
                    ? "No brands found matching your search"
                    : "No brands found. Click 'Add Brand' to create one."}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-200 hover:bg-gray-200">
                      <TableHead className="font-semibold text-gray-900">
                        Name
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900">
                        Logo
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
                    {Array.isArray(paginatedBrands) &&
                      paginatedBrands.map((brand) => (
                        <TableRow key={brand?._id || Math.random()}>
                          <TableCell className="text-gray-900 font-medium">
                            {brand?.name || "N/A"}
                          </TableCell>
                          <TableCell>
                            <div className="w-16 h-16 rounded-md overflow-hidden">
                              <img
                                src={getImageSrc(brand?.logo)}
                                alt={brand?.name || "Brand"}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-900">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                brand?.isActive === true
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {brand?.isActive === true ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleView(brand)}
                                className="border-orange-400 text-orange-500 h-10 w-10 hover:bg-orange-50 hover:text-orange-600"
                                disabled={isDeleting}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEdit(brand)}
                                className="border-green-400 text-green-500 h-10 w-10 hover:bg-green-50 hover:text-green-600"
                                disabled={isDeleting}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDelete(brand)}
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
            {filteredBrands.length > 0 && (
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
      <BrandViewModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        brand={selectedBrand}
      />
    </div>
  );
};

export default BrandList;
