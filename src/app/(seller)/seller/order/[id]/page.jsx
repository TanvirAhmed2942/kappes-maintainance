"use client";

import { useParams } from 'next/navigation';
import { IoArrowBack } from 'react-icons/io5';
import { Card, CardContent } from '../../../../../components/ui/card';
import { getImageUrl } from '../../../../../redux/baseUrl';
import { useGetOrderByIdQuery } from '../../../../../redux/sellerApi/orderlist/orderListApi';

const OrderDetails = () => {
  const { id } = useParams();
  const { data: orderData, isLoading, error } = useGetOrderByIdQuery(id, { skip: !id });

  console.log("order details", orderData);

  const handleDelete = (productIndex) => {
    console.log('Delete product at index:', productIndex);
    // Implement delete functionality for specific product in order
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate total items quantity
  const getTotalQuantity = () => {
    if (!orderData?.data?.products) return 0;
    return orderData.data.products.reduce((total, item) => total + item.quantity, 0);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading order details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">Error loading order details</div>
      </div>
    );
  }

  if (!orderData?.data) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">No order data found</div>
      </div>
    );
  }

  const order = orderData.data;

  return (
    <div className="">
      <button onClick={() => window.history.back()} className='border px-5 py-2 shadow rounded mb-5 cursor-pointer'><IoArrowBack /></button>
      <div className="space-y-6">
        {/* Header */}
        <h1 className="text-xl font-semibold text-gray-900">
          Order #{order._id.slice(-8).toUpperCase()}
        </h1>

        {/* All Items Section */}
        <Card className="shadow-sm p-0">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">All Items</h2>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-200 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Product Id
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Product Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Total Price
                    </th>

                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {order.products.map((item, index) => (
                    <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        #{item.product?._id.slice(-8).toUpperCase() || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.product?.name || 'Product not available'}
                      </td>
                      <td className="px-6 py-4">
                        {item.product?.images?.[0] ? (
                          <img
                            src={getImageUrl + item.product.images[0]}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-xs text-gray-500">No Image</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        ${item.unitPrice?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        ${((item.unitPrice || 0) * item.quantity).toFixed(2)}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className='flex flex-col gap-5 w-6/12'>
          {/* Summary Section */}
          <Card className="shadow-sm p-0">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>

              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 w-24">Order ID</span>
                  <span className="text-sm text-gray-900 font-medium">
                    #{order._id.slice(-8).toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 w-24">Date</span>
                  <span className="text-sm text-gray-900">
                    {formatDate(order.createdAt)}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 w-24">Status</span>
                  <span className={`text-sm font-medium ${order.status === 'Cancelled' ? 'text-red-600' :
                    order.status === 'Delivered' ? 'text-green-600' :
                      order.status === 'Pending' ? 'text-orange-500' :
                        'text-blue-600'
                    }`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 w-24">Items</span>
                  <span className="text-sm text-gray-900">{getTotalQuantity()}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 w-24">Subtotal</span>
                  <span className="text-sm text-gray-900">${order.totalAmount?.toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 w-24">Discount</span>
                    <span className="text-sm text-green-600">-${order.discount?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 w-24">Delivery</span>
                  <span className="text-sm text-gray-900">${order.deliveryCharge?.toFixed(2)}</span>
                </div>
                <div className="flex items-center pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-600 w-24 font-medium">Total</span>
                  <span className="text-sm text-red-600 font-semibold">
                    ${order.finalAmount?.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information Section */}
          <Card className="shadow-sm p-0">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h2>
              <div className="space-y-2">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Name:</span> {order.user?.full_name}
                </p>
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Email:</span> {order.user?.email}
                </p>
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Phone:</span> {order.user?.phone}
                </p>
                {order.user?.address && (
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Address:</span> {order.user.address.address}, {order.user.address.city}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address Section */}
          <Card className="shadow-sm p-0">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Shipping Address</h2>
              <p className="text-sm text-gray-600">
                {order.shippingAddress}
              </p>
            </CardContent>
          </Card>

          {/* Payment Method Section */}
          <Card className="shadow-sm p-0">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Payment Information</h2>
              <div className="space-y-2">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Method:</span> {order.paymentMethod}
                </p>
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Status:</span> {order.paymentStatus}
                </p>
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Delivery Option:</span> {order.deliveryOptions}
                </p>
                {order.deliveryDate && (
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Delivery Date:</span> {formatDate(order.deliveryDate)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;