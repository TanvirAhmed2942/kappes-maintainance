"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Eye } from "lucide-react";
import { useState, useMemo } from "react";
import {
  useCancelOrderMutation,
  useGetMyOrdersQuery,
} from "../../../redux/userprofileApi/userprofileApi";
import { Badge } from "../../../components/ui/badge";
import OrderDetailsModal from "./OrderDetailsModal";
import { TbBasketCancel } from "react-icons/tb";
import useToast from "../../../hooks/useShowToast";

export default function OrderHistory({ selectedMenu }) {
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: ordersResponse, isLoading, error } = useGetMyOrdersQuery();
  const [cancelOrder, { isLoading: cancelOrderLoading }] =
    useCancelOrderMutation();
  const { showSuccess, showError } = useToast();
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get orders from API response
  const orders = useMemo(() => {
    if (!ordersResponse?.success || !ordersResponse?.data?.result) {
      return [];
    }
    return ordersResponse.data.result.map((order) => ({
      _id: order._id,
      orderNo: `#${order._id.slice(-8).toUpperCase()}`,
      date: formatDate(order.createdAt),
      deliveryDate: formatDate(order.deliveryDate),
      items: order.products?.length || 0,
      totalItems:
        order.products?.reduce(
          (sum, product) => sum + (product.quantity || 0),
          0
        ) || 0,
      totalAmount: formatCurrency(order.totalAmount || 0),
      finalAmount: formatCurrency(order.finalAmount || 0),
      status: order.status || "Pending",
      paymentStatus: order.paymentStatus || "Unpaid",
      paymentMethod: order.paymentMethod || "N/A",
      deliveryOptions: order.deliveryOptions || "N/A",
      shippingAddress: order.shippingAddress || "N/A",
      discount: order.discount || 0,
      deliveryCharge: order.deliveryCharge || 0,
      products: order.products || [],
      // Store the full order data for detailed view
      fullOrderData: order,
    }));
  }, [ordersResponse]);

  // Handle view order details
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Handle cancel order
  const handleCancelOrder = async (order) => {
    if (!order) return;
    console.log("Cancel order", order);
    try {
      const response = await cancelOrder(order._id).unwrap();
      console.log(response);
      showSuccess(response.message || "Order cancelled successfully");
      // The order list will automatically refresh due to the invalidatesTags in the API
    } catch (error) {
      console.error("Failed to cancel order:", error);
      showError(
        error?.data?.message || "Failed to cancel order. Please try again."
      );
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Filter orders based on search
  const filteredOrders = useMemo(() => {
    if (!search) return orders;
    const searchLower = search.toLowerCase();
    return orders.filter(
      (order) =>
        order.orderNo.toLowerCase().includes(searchLower) ||
        order.status.toLowerCase().includes(searchLower) ||
        order.paymentStatus.toLowerCase().includes(searchLower)
    );
  }, [orders, search]);

  // Get status badge color
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower === "delivered" || statusLower === "completed") {
      return "bg-green-100 text-green-800";
    }
    if (statusLower === "pending" || statusLower === "processing") {
      return "bg-yellow-100 text-yellow-800";
    }
    if (statusLower === "canceled" || statusLower === "cancelled") {
      return "bg-red-100 text-red-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  // Get payment status color
  const getPaymentStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower === "paid") {
      return "bg-green-100 text-green-800";
    }
    return "bg-orange-100 text-orange-800";
  };

  if (selectedMenu !== 2) return null;
  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 h-fit bg-white rounded-md shadow-sm w-full overflow-auto z-10">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Order History</h2>
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 h-fit bg-white rounded-md shadow-sm w-full overflow-auto z-10">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Order History</h2>
        <div className="flex items-center justify-center py-8">
          <p className="text-red-500">
            Error loading orders. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 h-fit bg-white rounded-md shadow-sm w-full overflow-auto z-10">
      <h2 className="text-lg sm:text-xl font-semibold mb-4">Order History</h2>

      <div className="flex justify-end mb-3">
        <Input
          placeholder="Search by order number, status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64"
        />
      </div>

      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order No</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Final Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium">{order.orderNo}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.totalItems}</TableCell>
                  <TableCell>{order.totalAmount}</TableCell>
                  <TableCell className="font-semibold">
                    {order.finalAmount}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={getPaymentStatusColor(order.paymentStatus)}
                    >
                      {order.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right flex items-center gap-2 justify-end">
                    <Eye
                      title="View Order"
                      className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-900"
                      onClick={() => handleViewOrder(order)}
                    />
                    <TbBasketCancel
                      title="Cancel Order"
                      className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-900"
                      onClick={() => handleCancelOrder(order)}
                      disabled={cancelOrderLoading}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-gray-500"
                >
                  {search
                    ? "No orders found matching your search."
                    : "No orders found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {ordersResponse?.data?.meta && ordersResponse.data.meta.totalPage > 1 && (
        <div className="flex flex-wrap justify-end items-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={ordersResponse.data.meta.page === 1}
          >
            Prev
          </Button>
          {Array.from({ length: ordersResponse.data.meta.totalPage }).map(
            (_, idx) => (
              <Button
                key={idx + 1}
                size="sm"
                variant={
                  ordersResponse.data.meta.page === idx + 1
                    ? "default"
                    : "outline"
                }
                className={
                  ordersResponse.data.meta.page === idx + 1
                    ? "bg-[#AF1500] text-white hover:bg-[#8c1100]"
                    : ""
                }
              >
                {idx + 1}
              </Button>
            )
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={
              ordersResponse.data.meta.page ===
              ordersResponse.data.meta.totalPage
            }
          >
            Next
          </Button>
        </div>
      )}

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        selectedOrder={selectedOrder}
        formatCurrency={formatCurrency}
        getStatusColor={getStatusColor}
        getPaymentStatusColor={getPaymentStatusColor}
      />
    </div>
  );
}
