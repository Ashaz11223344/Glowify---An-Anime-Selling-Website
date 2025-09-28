import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Calendar, Package, Eye, MessageSquare } from "lucide-react";
import { useState } from "react";

interface CustomOrdersListProps {
  isAdmin?: boolean;
}

export function CustomOrdersList({ isAdmin = false }: CustomOrdersListProps) {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  
  const orders = useQuery(
    isAdmin ? api.customOrders.getAllCustomOrders : api.customOrders.getUserCustomOrders
  );
  const updateOrderStatus = useMutation(api.customOrders.updateCustomOrderStatus);

  const handleStatusUpdate = async (orderId: string, status: string) => {
    if (!isAdmin) return;
    
    try {
      await updateOrderStatus({
        orderId: orderId as any,
        status,
        adminNotes: adminNotes || undefined,
      });
      toast.success("Order status updated");
      setSelectedOrder(null);
      setAdminNotes("");
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-yellow-500 bg-yellow-500/10";
      case "processing": return "text-blue-500 bg-blue-500/10";
      case "completed": return "text-green-500 bg-green-500/10";
      case "cancelled": return "text-red-500 bg-red-500/10";
      default: return "text-gray-500 bg-gray-500/10";
    }
  };

  if (!orders) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Custom Orders</h3>
        <p className="text-muted-foreground">
          {isAdmin ? "No custom orders have been placed yet." : "You haven't placed any custom orders yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        {isAdmin ? "All Custom Orders" : "My Custom Orders"}
      </h2>

      <div className="grid gap-6">
        {orders.map((order) => (
          <div key={order._id} className="glass rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{order.customerName}</h3>
                <p className="text-sm text-muted-foreground">
                  Order #{order._id.slice(-8)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <button
                  onClick={() => setSelectedOrder(selectedOrder === order._id ? null : order._id)}
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Frame Details</p>
                <p className="font-medium">
                  {order.frameSize} - {order.frameType.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                </p>
                <p className="text-sm">Quantity: {order.quantity}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact</p>
                <p className="font-medium">{order.email}</p>
                <p className="text-sm">{order.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(order._creationTime).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Package className="w-4 h-4" />
                {order.imageIds.length} image{order.imageIds.length !== 1 ? 's' : ''}
              </div>
              <div className="font-semibold text-primary">
                ${order.totalAmount}
              </div>
            </div>

            {selectedOrder === order._id && (
              <div className="border-t border-border pt-4 mt-4 space-y-4">
                {/* Images */}
                {order.imageUrls && order.imageUrls.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Uploaded Images</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {order.imageUrls.map((url, index) => (
                        url && (
                          <img
                            key={index}
                            src={url}
                            alt={`Custom order image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Instructions */}
                {order.customInstructions && (
                  <div>
                    <h4 className="font-medium mb-2">Custom Instructions</h4>
                    <p className="text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">
                      {order.customInstructions}
                    </p>
                  </div>
                )}

                {/* Address */}
                <div>
                  <h4 className="font-medium mb-2">Delivery Address</h4>
                  <p className="text-sm bg-muted p-3 rounded-lg">
                    {order.address}
                  </p>
                </div>

                {/* Admin Notes */}
                {order.adminNotes && (
                  <div>
                    <h4 className="font-medium mb-2">Admin Notes</h4>
                    <p className="text-sm bg-primary/10 p-3 rounded-lg">
                      {order.adminNotes}
                    </p>
                  </div>
                )}

                {/* Admin Controls */}
                {isAdmin && (
                  <div className="border-t border-border pt-4">
                    <h4 className="font-medium mb-3">Admin Actions</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-2">Admin Notes</label>
                        <textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          placeholder="Add notes for this order..."
                          className="w-full h-20 px-3 py-2 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none text-sm"
                        />
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {["pending", "processing", "completed", "cancelled"].map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusUpdate(order._id, status)}
                            disabled={order.status === status}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              order.status === status
                                ? "bg-muted text-muted-foreground cursor-not-allowed"
                                : "bg-primary/10 text-primary hover:bg-primary/20"
                            }`}
                          >
                            Mark as {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
