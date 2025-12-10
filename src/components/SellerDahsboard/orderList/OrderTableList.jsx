"use client";

import { Eye, Filter, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  useDeleteOrderMutation,
  useGetAllOrderQuery,
} from "../../../redux/sellerApi/orderlist/orderListApi";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";

const OrderTableList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const router = useRouter();
  const shopId =
    typeof window !== "undefined" ? localStorage.getItem("shop") : null;

  const {
    data: orderData,
    isLoading,
    error,
  } = useGetAllOrderQuery({ status: "", id: shopId }, { skip: !shopId });

  const [deleteOrder, { isLoading: deleteOrderLoading }] =
    useDeleteOrderMutation();

  // Format orders from API response
  const formatOrders = (orders) => {
    if (!orders || !Array.isArray(orders)) return [];

    return orders.map((order) => ({
      id: order._id,
      shortId: `#${order._id.slice(-8).toUpperCase()}`,
      date: new Date(order.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      customer: order.user?.full_name || "Unknown Customer",
      amount: `$${order.finalAmount?.toFixed(2) || "0.00"}`,
      status: order.status,
      rawData: order, // Keep original data for reference
    }));
  };

  // Get orders from API response
  const apiOrders = useMemo(() => {
    return orderData?.data?.orders ? formatOrders(orderData.data.orders) : [];
  }, [orderData]);

  // Filter and search functionality
  const filteredOrders = useMemo(() => {
    if (!apiOrders.length) return [];

    return apiOrders.filter((order) => {
      const matchesSearch =
        order.shortId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterStatus === "default" ||
        order.status.toLowerCase() === filterStatus.toLowerCase();

      return matchesSearch && matchesFilter;
    });
  }, [apiOrders, searchTerm, filterStatus]);

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "text-green-600";
      case "pending":
        return "text-orange-500";
      case "cancelled":
        return "text-red-600";
      case "processing":
        return "text-blue-600";
      case "shipped":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  const handleView = (orderId) => {
    console.log("View order", orderId);
    router.push(`/seller/order/${orderId}`);
  };

  const handleEdit = (orderId) => {
    console.log("Edit order", orderId);
    // Implement edit functionality
  };

  const handleDeleteClick = (order) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;

    try {
      const response = await deleteOrder(orderToDelete.id).unwrap();
      console.log(response);
      alert(response.message);
      console.log("Order deleted successfully:", orderToDelete.id);
      // The order list will automatically refresh due to the invalidatesTags in the API
    } catch (error) {
      console.error("Failed to delete order:", error.data);
      // You can add toast notification here if needed
    } finally {
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setOrderToDelete(null);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 3;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 1);
      const end = Math.min(totalPages, start + maxVisiblePages - 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">Error loading orders</div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="">
        {/* Card Container */}
        <Card className="shadow-sm p-0">
          <CardContent className="p-6">
            {/* Top Bar */}
            <div className="flex pb-6 justify-between items-center border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">Order List</h1>

              <div className="flex items-center gap-4">
                {/* Filter Dropdown */}
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Default" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by order ID, customer, or date..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-200 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Order Id
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {paginatedOrders.length > 0 ? (
                    paginatedOrders.map((order, index) => (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {order.shortId}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {order.date}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {order.customer}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {order.amount}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-sm font-medium ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleView(order.id)}
                              className="border-orange-400 h-10 w-10 text-orange-500 hover:bg-orange-50 hover:text-orange-600"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {/* <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEdit(order.id)}
                              className="border-green-400 text-green-500 h-10 w-10 hover:bg-green-50 hover:text-green-600"
                            >
                              <Edit className="w-4 h-4" />
                            </Button> */}
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteClick(order)}
                              disabled={deleteOrderLoading}
                              className="border-red-400 text-red-500 h-10 w-10 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        {apiOrders.length === 0
                          ? "No orders found"
                          : "No orders match your search criteria"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredOrders.length > 0 && (
              <div className="p-6 border-t border-gray-200 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredOrders.length)}{" "}
                  of {filteredOrders.length} orders
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      handlePageChange(Math.max(1, currentPage - 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Prev
                  </Button>
                  {generatePageNumbers().map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => handlePageChange(page)}
                      className={
                        currentPage === page
                          ? "bg-red-700 hover:bg-red-800"
                          : ""
                      }
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() =>
                      handlePageChange(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
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
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this order?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              order <strong>{orderToDelete?.shortId}</strong> for customer{" "}
              <strong>{orderToDelete?.customer}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteOrderLoading}
            >
              {deleteOrderLoading ? "Deleting..." : "Delete Order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrderTableList;
