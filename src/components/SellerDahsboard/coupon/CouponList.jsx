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
  useGetCouponsQuery,
  useDeleteCouponMutation,
} from "../../../redux/sellerApi/couponApi/couponApi";
import useToast from "../../../hooks/useShowToast";
import CouponViewModal from "./CouponViewModal";

const CouponList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const { data: couponsData, isLoading, error, refetch } = useGetCouponsQuery();
  const [deleteCoupon, { isLoading: isDeleting }] = useDeleteCouponMutation();

  // Ensure coupons is always an array
  const coupons = Array.isArray(couponsData?.data)
    ? couponsData.data
    : Array.isArray(couponsData)
    ? couponsData
    : [];

  // Debug logging
  console.log("Coupons API Response:", couponsData);
  console.log("Processed coupons array:", coupons);

  const filteredCoupons = useMemo(() => {
    // Ensure coupons is an array before filtering
    if (!Array.isArray(coupons)) {
      console.warn("Coupons is not an array:", coupons);
      return [];
    }

    if (!searchTerm.trim()) {
      return coupons;
    }

    const searchLower = searchTerm.toLowerCase();
    return coupons.filter(
      (coupon) =>
        coupon?.code?.toLowerCase().includes(searchLower) ||
        coupon?.discountType?.toLowerCase().includes(searchLower) ||
        coupon?.discountValue?.toString().includes(searchLower)
    );
  }, [coupons, searchTerm]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleView = (coupon) => {
    setSelectedCoupon(coupon);
    setIsViewModalOpen(true);
  };

  const handleEdit = (coupon) => {
    router.push(
      `/seller/coupon/add-coupon?code=${encodeURIComponent(coupon.code)}`
    );
  };

  const handleDelete = async (coupon) => {
    if (!confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) {
      return;
    }

    try {
      const response = await deleteCoupon(coupon._id).unwrap();
      if (response?.success) {
        toast.showSuccess("Coupon deleted successfully!");
        refetch();
      } else {
        toast.showError(response?.message || "Failed to delete coupon");
      }
    } catch (error) {
      console.error("Delete coupon error:", error);
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to delete coupon. Please try again.";
      toast.showError(errorMessage);
    }
  };

  return (
    <div className="">
      <div className="">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Coupon List</h1>

        {/* Card Container */}
        <Card className="shadow-sm p-0">
          <CardContent className="p-5">
            {/* Top Bar */}
            <div className=" flex pb-4 justify-between items-center border-b border-gray-200">
              <Button
                onClick={() => router.push("/seller/coupon/add-coupon")}
                className="bg-red-700 hover:bg-red-800 text-white"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Coupon
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
                <div className="text-center py-8">Loading coupons...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-600">
                  Error loading coupons:{" "}
                  {error?.data?.message || error?.message || "Unknown error"}
                  <div className="text-xs mt-2 text-gray-500">
                    Please check your connection and try again.
                  </div>
                </div>
              ) : !Array.isArray(filteredCoupons) ? (
                <div className="text-center py-8 text-red-600">
                  Invalid data format received from server.
                  <div className="text-xs mt-2 text-gray-500">
                    Expected array but got: {typeof filteredCoupons}
                  </div>
                </div>
              ) : filteredCoupons.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm
                    ? "No coupons found matching your search"
                    : "No coupons found. Click 'Add Coupon' to create one."}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-200 hover:bg-gray-200">
                      <TableHead className="font-semibold text-gray-900">
                        Code
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900">
                        Discount Type
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900">
                        Discount Value
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900">
                        Min Order
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900">
                        Max Discount
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900">
                        Start Date
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900">
                        End Date
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
                    {Array.isArray(filteredCoupons) &&
                      filteredCoupons.map((coupon) => (
                        <TableRow key={coupon?._id || Math.random()}>
                          <TableCell className="text-gray-900 font-medium">
                            {coupon?.code || "N/A"}
                          </TableCell>
                          <TableCell className="text-gray-900">
                            {coupon?.discountType || "N/A"}
                          </TableCell>
                          <TableCell className="text-gray-900">
                            {coupon?.discountType === "Percentage"
                              ? `${coupon?.discountValue || 0}%`
                              : `$${coupon?.discountValue || 0}`}
                          </TableCell>
                          <TableCell className="text-gray-900">
                            {coupon?.minOrderAmount
                              ? `$${coupon.minOrderAmount}`
                              : "N/A"}
                          </TableCell>
                          <TableCell className="text-gray-900">
                            {coupon?.maxDiscountAmount
                              ? `$${coupon.maxDiscountAmount}`
                              : "N/A"}
                          </TableCell>
                          <TableCell className="text-gray-900">
                            {formatDate(coupon?.startDate)}
                          </TableCell>
                          <TableCell className="text-gray-900">
                            {formatDate(coupon?.endDate)}
                          </TableCell>
                          <TableCell className="text-gray-900">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                coupon?.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {coupon?.isActive ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleView(coupon)}
                                className="border-orange-400 text-orange-500 h-10 w-10 hover:bg-orange-50 hover:text-orange-600"
                                disabled={isDeleting}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEdit(coupon)}
                                className="border-green-400 text-green-500 h-10 w-10 hover:bg-green-50 hover:text-green-600"
                                disabled={isDeleting}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDelete(coupon)}
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
            <div className="p-6 border-t border-gray-200 flex justify-end items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Prev
              </Button>
              <Button
                variant={currentPage === 1 ? "default" : "outline"}
                onClick={() => setCurrentPage(1)}
                className={
                  currentPage === 1 ? "bg-red-700 hover:bg-red-800" : ""
                }
              >
                1
              </Button>
              <Button
                variant={currentPage === 2 ? "default" : "outline"}
                onClick={() => setCurrentPage(2)}
                className={
                  currentPage === 2 ? "bg-red-700 hover:bg-red-800" : ""
                }
              >
                2
              </Button>
              <Button
                variant={currentPage === 3 ? "default" : "outline"}
                onClick={() => setCurrentPage(3)}
                className={
                  currentPage === 3 ? "bg-red-700 hover:bg-red-800" : ""
                }
              >
                3
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(3, currentPage + 1))}
                disabled={currentPage === 3}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Modal */}
      <CouponViewModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        coupon={selectedCoupon}
      />
    </div>
  );
};

export default CouponList;
