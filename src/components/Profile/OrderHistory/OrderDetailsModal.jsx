"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import Image from "next/image";
import { getImageUrl } from "../../../redux/baseUrl";

export default function OrderDetailsModal({
  isOpen,
  onClose,
  selectedOrder,
  formatCurrency,
  getStatusColor,
  getPaymentStatusColor,
}) {
  if (!selectedOrder) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            Complete information about order {selectedOrder.orderNo}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Order Number
                  </p>
                  <p className="font-semibold">{selectedOrder.orderNo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Order Date
                  </p>
                  <p>{selectedOrder.date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Delivery Date
                  </p>
                  <p>{selectedOrder.deliveryDate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Payment Status
                  </p>
                  <Badge
                    className={getPaymentStatusColor(
                      selectedOrder.paymentStatus
                    )}
                  >
                    {selectedOrder.paymentStatus}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Payment Method
                  </p>
                  <p>{selectedOrder.paymentMethod}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Name</p>
                  <p>{selectedOrder.fullOrderData.user?.full_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p>{selectedOrder.fullOrderData.user?.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Phone</p>
                  <p>{selectedOrder.fullOrderData.user?.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Delivery Option
                  </p>
                  <p>{selectedOrder.deliveryOptions}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Shipping Address
                </p>
                <p>{selectedOrder.shippingAddress}</p>
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Products ({selectedOrder.fullOrderData.products?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedOrder.fullOrderData.products?.map(
                  (productItem, index) => (
                    <div
                      key={index}
                      className="flex gap-4 p-4 border rounded-lg"
                    >
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={
                            productItem.product?.images?.[0]
                              ? `${getImageUrl}${productItem.product.images[0]}`
                              : "/assets/bag.png"
                          }
                          alt={productItem.product?.name || "Product"}
                          fill
                          className="object-cover rounded-md"
                          onError={(e) => {
                            e.target.src = "/assets/bag.png";
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-lg">
                          {productItem.product?.name || "Product Name"}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {productItem.product?.description || "No description"}
                        </p>

                        {/* Debug info to show product uniqueness */}
                        <div className="mt-1 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                          <p>
                            <strong>Product ID:</strong>{" "}
                            {productItem.product?._id ||
                              productItem.product?.id}
                          </p>
                          <p>
                            <strong>Variant ID:</strong> {productItem.variant}
                          </p>
                          <p>
                            <strong>Order Item ID:</strong> {productItem._id}
                          </p>
                        </div>

                        {/* Product Details */}
                        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Base Price:</span>
                            <span className="ml-2 font-medium">
                              {formatCurrency(
                                productItem.product?.basePrice || 0
                              )}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Category:</span>
                            <span className="ml-2">
                              {productItem.product?.categoryId || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Stock:</span>
                            <span className="ml-2">
                              {productItem.product?.totalStock || 0}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Rating:</span>
                            <span className="ml-2">
                              {productItem.product?.avg_rating || 0}/5 ⭐
                            </span>
                          </div>
                        </div>

                        {/* Order specific details */}
                        <div className="mt-3 space-y-1 text-sm bg-gray-50 p-3 rounded">
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Ordered Quantity:
                            </span>
                            <span className="font-medium">
                              {productItem.quantity}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Unit Price:</span>
                            <span className="font-medium">
                              {formatCurrency(productItem.unitPrice)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Variant ID:</span>
                            <span className="text-xs text-gray-500">
                              {productItem.variant}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Order Date:</span>
                            <span className="text-xs text-gray-500">
                              {selectedOrder.date}
                            </span>
                          </div>
                          <Separator className="my-2" />
                          <div className="flex justify-between">
                            <span className="text-gray-600 font-medium">
                              Subtotal:
                            </span>
                            <span className="font-semibold text-red-600">
                              {formatCurrency(
                                productItem.unitPrice * productItem.quantity
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Product Tags */}
                        {productItem.product?.tags &&
                          productItem.product.tags.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs text-gray-500 mb-1">
                                Tags:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {productItem.product.tags.map(
                                  (tag, tagIndex) => (
                                    <Badge
                                      key={tagIndex}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {tag}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Totals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Totals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>{selectedOrder.totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Charge:</span>
                  <span>{formatCurrency(selectedOrder.deliveryCharge)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount:</span>
                    <span className="text-green-600">
                      -{formatCurrency(selectedOrder.discount)}
                    </span>
                  </div>
                )}
                {selectedOrder.fullOrderData.coupon && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coupon Applied:</span>
                    <span className="text-blue-600">
                      {selectedOrder.fullOrderData.coupon}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Final Amount:</span>
                  <span className="text-red-600">
                    {selectedOrder.finalAmount}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
