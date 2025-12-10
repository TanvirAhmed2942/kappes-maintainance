"use client";

import { Edit, Eye, Plus, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { getImageUrl } from "../../../redux/baseUrl";
import {
  useDeleteProductMutation,
  useGetAllProductQuery,
} from "../../../redux/sellerApi/product/productApi";

const ProductList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productIdToDelete, setProductIdToDelete] = useState(null);
  const router = useRouter();
  const shopId = localStorage.getItem("shop");

  const { data, isLoading, error } = useGetAllProductQuery(shopId, searchTerm);
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  // Handle different response structures
  const products =
    data?.data?.result || data?.data?.products || data?.result || [];
  const meta = data?.data?.meta || {
    total: 0,
    page: 1,
    totalPage: 1,
    limit: 10,
  };

  const handleView = (product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handleEdit = (productId) => {
    router.push("/seller/product/edit-product/" + productId);
  };

  const handleDeleteClick = (productId) => {
    setProductIdToDelete(productId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteProduct(productIdToDelete).unwrap();
      setShowDeleteModal(false);
      setProductIdToDelete(null);
      alert("Product deleted successfully!");
    } catch (error) {
      alert(
        "Failed to delete product: " + (error?.data?.message || "Unknown error")
      );
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="">
      <div className="">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Product List</h1>

        <Card className="shadow-sm p-0">
          <CardContent className="p-5">
            <div className="flex pb-4 justify-between items-center border-b border-gray-200">
              <Button
                onClick={() => router.push("/seller/product/add-product")}
                className="bg-red-700 hover:bg-red-800 text-white"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Product
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

            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-700"></div>
                  <p className="mt-2 text-gray-500">Loading products...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-500">
                    Error loading products:{" "}
                    {error?.data?.message || error?.message || "Unknown error"}
                  </p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No products found</p>
                  {searchTerm && (
                    <p className="text-gray-400 text-sm mt-2">
                      Try adjusting your search term
                    </p>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-200 hover:bg-gray-200">
                      <TableHead className="font-semibold text-gray-900">
                        Product Name
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900">
                        Product Id
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900">
                        Category
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900">
                        Subcategory
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900">
                        Price
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900">
                        Stock
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900">
                        Publish Date
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell className="text-gray-900">
                          {product.name}
                        </TableCell>
                        <TableCell className="text-gray-900">
                          #{product._id.slice(-8)}
                        </TableCell>
                        <TableCell className="text-gray-900">
                          {product.categoryId?.name || "N/A"}
                        </TableCell>
                        <TableCell className="text-gray-900">
                          {product.subcategoryId?.name || "N/A"}
                        </TableCell>
                        <TableCell className="text-gray-900">
                          ${product.basePrice?.toFixed(2) || "0.00"}
                        </TableCell>
                        <TableCell className="text-gray-900">
                          {product.totalStock ??
                            (product.product_variant_Details?.reduce(
                              (sum, v) => sum + (v.variantQuantity || 0),
                              0
                            ) ||
                              0)}
                        </TableCell>
                        <TableCell className="text-gray-900">
                          {formatDate(product.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleView(product)}
                              className="border-orange-400 text-orange-500 h-10 w-10 hover:bg-orange-50 hover:text-orange-600"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEdit(product._id)}
                              className="border-green-400 text-green-500 h-10 w-10 hover:bg-green-50 hover:text-green-600"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteClick(product._id)}
                              className="border-red-400 text-red-500 h-10 w-10 hover:bg-red-50 hover:text-red-600"
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

            {meta.totalPage > 1 && (
              <div className="p-6 border-t border-gray-200 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Showing {products.length} of {meta.total} products
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || isLoading}
                  >
                    Prev
                  </Button>
                  {[...Array(Math.min(meta.totalPage, 10))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={i}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        onClick={() => setCurrentPage(pageNum)}
                        className={
                          currentPage === pageNum
                            ? "bg-red-700 hover:bg-red-800 text-white"
                            : ""
                        }
                        disabled={isLoading}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage(Math.min(meta.totalPage, currentPage + 1))
                    }
                    disabled={currentPage === meta.totalPage || isLoading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-700 hover:bg-red-800"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Product Dialog */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Product Details</DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Images</h3>
                <div className=" h-full transition-all duration-300 flex items-center justify-center">
                  {selectedProduct.images?.map((img, idx) => (
                    <img
                      key={idx}
                      src={getImageUrl + img}
                      alt={`Product ${idx}`}
                      className="w-full h-full object-contain rounded"
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Name</h3>
                  <p>{selectedProduct.name}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Description</h3>
                  <p className="text-sm">{selectedProduct.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Category</h3>
                  <p>{selectedProduct.categoryId?.name || "N/A"}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Subcategory</h3>
                  <p>{selectedProduct.subcategoryId?.name || "N/A"}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Brand</h3>
                  <p>{selectedProduct.brandId?.name || "N/A"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-700">Base Price</h3>
                    <p>${selectedProduct.basePrice?.toFixed(2) || "0.00"}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Total Stock</h3>
                    <p>
                      {selectedProduct.totalStock ??
                        (selectedProduct.product_variant_Details?.reduce(
                          (sum, v) => sum + (v.variantQuantity || 0),
                          0
                        ) ||
                          0)}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Tags</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedProduct.tags?.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-200 rounded text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedProduct && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-700 mb-3">Variants</h3>
              {selectedProduct.product_variant_Details?.length > 0 ? (
                <div className="space-y-3">
                  {selectedProduct.product_variant_Details.map(
                    (variant, idx) => {
                      const variantData = variant.variantId || {};
                      const skipKeys = [
                        "_id",
                        "categoryId",
                        "subCategoryId",
                        "createdBy",
                        "isDeleted",
                        "slug",
                        "createdAt",
                        "updatedAt",
                        "__v",
                        "id",
                        "images",
                        "image",
                        "description",
                      ];

                      return (
                        <div
                          key={idx}
                          className="border p-4 rounded-lg bg-gray-50"
                        >
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <span className="font-semibold text-gray-700">
                                Variant Price:
                              </span>{" "}
                              <span className="text-gray-900">
                                $
                                {variant.variantPrice || variant.price || "N/A"}
                              </span>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-700">
                                Quantity:
                              </span>{" "}
                              <span className="text-gray-900">
                                {variant.variantQuantity ||
                                  variant.quantity ||
                                  0}
                              </span>
                            </div>
                          </div>
                          <div className="border-t pt-3">
                            <h4 className="font-semibold text-gray-700 mb-2 text-sm">
                              Variant Details:
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                              {Object.keys(variantData)
                                .filter((key) => !skipKeys.includes(key))
                                .map((key) => {
                                  const value = variantData[key];
                                  let displayValue = value;

                                  // Handle color object
                                  if (
                                    key === "color" &&
                                    typeof value === "object"
                                  ) {
                                    displayValue = (
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="w-4 h-4 rounded-full border border-gray-300"
                                          style={{
                                            backgroundColor:
                                              value.code || value,
                                          }}
                                        />
                                        <span>
                                          {value.name || value.code || value}
                                        </span>
                                      </div>
                                    );
                                  } else if (
                                    value === null ||
                                    value === undefined ||
                                    value === ""
                                  ) {
                                    return null;
                                  }

                                  return (
                                    <div key={key} className="text-sm">
                                      <span className="font-medium text-gray-600 capitalize">
                                        {key
                                          .replace(/([A-Z])/g, " $1")
                                          .toLowerCase()}
                                        :
                                      </span>{" "}
                                      <span className="text-gray-900">
                                        {displayValue}
                                      </span>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No variants available</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductList;
