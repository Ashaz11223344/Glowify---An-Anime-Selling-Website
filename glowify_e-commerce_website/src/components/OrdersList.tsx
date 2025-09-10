import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CheckCircle, Clock, Package } from "lucide-react";
import { toast } from "sonner";

export function OrdersList() {
  const orders = useQuery(api.orders.getAllOrders) || [];
  const updateOrderStatus = useMutation(api.orders.updateOrderStatus);

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus({ orderId: orderId as any, status });
      toast.success("Order status updated");
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case "confirmed":
        return <Package className="w-5 h-5 text-blue-400" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-400 bg-yellow-400/10";
      case "confirmed":
        return "text-blue-400 bg-blue-400/10";
      case "completed":
        return "text-green-400 bg-green-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-24 h-24 text-gray-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">No orders yet</h2>
        <p className="text-gray-400">Orders will appear here when customers place them.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Orders ({orders.length})</h2>
      
      <div className="space-y-4">
        {orders.map((order: any) => (
          <div
            key={order._id}
            className="bg-white/5 rounded-lg p-6 border border-gray-700"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold text-lg">{order.productName}</h3>
                <p className="text-gray-400 text-sm">
                  Order placed on {new Date(order._creationTime).toLocaleDateString()}
                </p>
              </div>
              <div className={`flex items-center px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="ml-2 text-sm font-semibold capitalize">{order.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <h4 className="text-white font-semibold mb-2">Customer Details</h4>
                <div className="space-y-1 text-gray-300">
                  <p><strong>Name:</strong> {order.customerName}</p>
                  <p><strong>Email:</strong> {order.email}</p>
                  <p><strong>Phone:</strong> {order.phone}</p>
                  <p><strong>Address:</strong> {order.address}</p>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">Order Details</h4>
                <div className="space-y-1 text-gray-300">
                  <p><strong>Product:</strong> {order.productName}</p>
                  <p><strong>Quantity:</strong> {order.quantity}</p>
                  <p><strong>Total Amount:</strong> ₹{order.totalAmount}</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              {order.status === "pending" && (
                <button
                  onClick={() => handleStatusUpdate(order._id, "confirmed")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Confirm Order
                </button>
              )}
              {order.status === "confirmed" && (
                <button
                  onClick={() => handleStatusUpdate(order._id, "completed")}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Mark as Completed
                </button>
              )}
              <a
                href={`https://wa.me/${order.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Contact Customer
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
