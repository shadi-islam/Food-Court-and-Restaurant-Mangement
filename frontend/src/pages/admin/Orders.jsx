import { useContext, useEffect, useState, useCallback } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";
import { 
  ShoppingBag, User, Hash, CreditCard, 
  Clock, ChevronDown, DollarSign, Zap, ChevronUp, Inbox
} from "lucide-react";
import styles from "./Orders.module.css";

const Orders = () => {
  const { admin, axios, loading, setLoading, socket } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [notifyDraft, setNotifyDraft] = useState({});

  // Maps order status to the correct CSS class
  const statusClasses = {
    "Approved": styles.statusApproved,
    "Processing in Kitchen": styles.statusKitchen,
    "Ready to Serve": styles.statusReady,
    "Served": styles.statusServed,
  };

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/order/orders");
      if (data.success) setOrders(data.orders);
      else toast.error(data.message);
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  }, [axios]);

  // Update the local state instantly to keep the UI snappy
  const updateLocalOrder = (orderId, updatedFields) => {
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, ...updatedFields } : o));
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setLoading(true);
      const { data } = await axios.put(`/api/order/update-status/${orderId}`, { status: newStatus });
      if (data.success) {
        toast.success("Status updated");
        updateLocalOrder(orderId, { status: newStatus });
      }
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentStatusChange = async (orderId, paymentStatus) => {
    try {
      setLoading(true);
      const { data } = await axios.put(`/api/order/update-payment/${orderId}`, { paymentStatus });
      if (data.success) {
        toast.success("Payment updated");
        updateLocalOrder(orderId, { paymentStatus });
      }
    } catch (error) {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDiscountChange = async (orderId, discount) => {
    const discountValue = Number(discount);
    if (isNaN(discountValue) || discountValue < 0) return toast.error("Invalid discount");
    try {
      setLoading(true);
      const { data } = await axios.put(`/api/order/update-discount/${orderId}`, { discount: discountValue });
      if (data.success) {
        toast.success("Discount applied");
        updateLocalOrder(orderId, { discount: discountValue });
      }
    } catch (error) {
      toast.error("Discount error");
    } finally {
      setLoading(false);
    }
  };

  const handleEstimatedTimeChange = async (orderId, estimatedTime) => {
    const timeValue = Number(estimatedTime);
    try {
      setLoading(true);
      const { data } = await axios.put(`/api/order/update-estimated-time/${orderId}`, { estimatedTime: timeValue });
      if (data.success) {
        toast.success("Time updated");
        updateLocalOrder(orderId, { estimatedTime: timeValue });
      }
    } catch (error) {
      toast.error("Time update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (orderId) => {
    const draft = notifyDraft[orderId] || {};
    if (!draft.message?.trim()) return toast.error("Write a message first");
    try {
      setLoading(true);
      const { data } = await axios.post(`/api/notification/send/order/${orderId}`, { 
        title: draft.title || "Restaurant Update", 
        message: draft.message 
      });
      if (data.success) {
        toast.success("Notification sent");
        setNotifyDraft(prev => ({ ...prev, [orderId]: { title: "", message: "" } }));
      }
    } catch (error) {
      toast.error("Notification failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (admin) fetchOrders();
  }, [admin, fetchOrders]);

  // Setup socket listeners for real-time order updates
  useEffect(() => {
    if (!socket) return;

    // Listen for order status updates
    const handleOrderStatus = (data) => {
      setOrders(prev => prev.map(o => 
        o._id === data.orderId ? { ...o, status: data.status } : o
      ));
    };

    // Listen for payment status updates
    const handlePaymentStatus = (data) => {
      setOrders(prev => prev.map(o => 
        o._id === data.orderId ? { ...o, paymentStatus: data.paymentStatus } : o
      ));
    };

    // Listen for discount updates
    const handleDiscount = (data) => {
      setOrders(prev => prev.map(o => 
        o._id === data.orderId ? { ...o, discount: data.discount } : o
      ));
    };

    // Listen for estimated time updates
    const handleEstimatedTime = (data) => {
      setOrders(prev => prev.map(o => 
        o._id === data.orderId ? { ...o, estimatedTime: data.estimatedTime } : o
      ));
    };

    // Listen for new orders
    const handleNewOrder = (data) => {
      // Add new order to the list
      setOrders(prev => [data.order, ...prev]);
    };

    socket.on("order:status", handleOrderStatus);
    socket.on("order:paymentStatus", handlePaymentStatus);
    socket.on("order:discount", handleDiscount);
    socket.on("order:estimatedTime", handleEstimatedTime);
    socket.on("order:new", handleNewOrder);

    return () => {
      socket.off("order:status", handleOrderStatus);
      socket.off("order:paymentStatus", handlePaymentStatus);
      socket.off("order:discount", handleDiscount);
      socket.off("order:estimatedTime", handleEstimatedTime);
      socket.off("order:new", handleNewOrder);
    };
  }, [socket]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <ShoppingBag className={styles.titleIcon} size={24} />
          <h1 className={styles.title}>Live Orders</h1>
        </div>
        <div className={styles.badge}>{orders.length} Active</div>
      </header>

      <div className={styles.container}>
        <div className={styles.tableHeader}>
          <div className={styles.colName}>Customer</div>
          <div className={styles.colTable}>Table</div>
          <div className={styles.colTotal}>Total</div>
          <div className={styles.colPay}>Payment</div>
          <div className={styles.colStatus}>Status</div>
        </div>

        <div className={styles.list}>
          {orders.length === 0 && !loading ? (
            <div className={styles.emptyState}>
              <Inbox size={48} strokeWidth={1} />
              <p>No active orders right now.</p>
            </div>
          ) : (
            orders.map((o) => (
              <div key={o._id} className={`${styles.orderCard} ${expandedOrder === o._id ? styles.cardExpanded : ""}`}>
                <div className={styles.rowGrid}>
                  <div className={styles.colName}>
                    <div className={styles.userInfo}>
                      <div className={styles.userAvatar}><User size={14} /></div>
                      <span className={styles.cellStrong}>{o?.user?.name || "Guest"}</span>
                    </div>
                  </div>

                  <div className={styles.colTable}>
                    <span className={styles.tableBadge}><Hash size={12} /> {o?.tableNumber}</span>
                  </div>

                  <div className={styles.colTotal}>
                    <div className={styles.priceContainer}>
                      <span className={styles.price}>৳{o?.totalAmount - (o?.discount || 0)}</span>
                      {o?.discount > 0 && <span className={styles.discountLabel}>(-৳{o.discount})</span>}
                    </div>
                  </div>

                  <div className={styles.colPay}>
                    <div className={styles.payMethod}><CreditCard size={14} /><span>{o?.paymentMethod}</span></div>
                  </div>

                  <div className={styles.colStatus}>
                    <div className={styles.selectWrapper}>
                      <select
                        className={`${styles.select} ${statusClasses[o.status] || ""}`}
                        value={o.status}
                        onChange={(e) => handleStatusChange(o._id, e.target.value)}
                        disabled={loading}
                      >
                        <option value="Approved">Approved</option>
                        <option value="Processing in Kitchen">In Kitchen</option>
                        <option value="Ready to Serve">Ready</option>
                        <option value="Served">Served</option>
                      </select>
                      <ChevronDown className={styles.selectIcon} size={14} />
                    </div>
                  </div>
                </div>

                <div className={styles.expandToggle}>
                  <button onClick={() => setExpandedOrder(expandedOrder === o._id ? null : o._id)}>
                    {expandedOrder === o._id ? <><ChevronUp size={14} /> Hide Details</> : <><ChevronDown size={14} /> Controls & Items</>}
                  </button>
                </div>

                {expandedOrder === o._id && (
                  <div className={styles.expandedSection}>
                    <div className={styles.adminControls}>
                      <div className={styles.controlField}>
                        <label><DollarSign size={14} /> Payment</label>
                        <select value={o?.paymentStatus || "Unpaid"} onChange={(e) => handlePaymentStatusChange(o._id, e.target.value)} disabled={loading}>
                          <option value="Unpaid">Unpaid</option>
                          <option value="Paid">Paid</option>
                        </select>
                      </div>

                      <div className={styles.controlField}>
                        <label><DollarSign size={14} /> Discount (৳)</label>
                        <input type="number" defaultValue={o?.discount || 0} onBlur={(e) => handleDiscountChange(o._id, e.target.value)} min="0" />
                      </div>

                      <div className={styles.controlField}>
                        <label><Zap size={14} /> Est. Time (min)</label>
                        <input type="number" defaultValue={o?.estimatedTime || 0} onBlur={(e) => handleEstimatedTimeChange(o._id, e.target.value)} min="0" />
                      </div>
                    </div>

                    <div className={styles.notificationZone}>
                        <label><Clock size={14} /> Custom Notification</label>
                        <div className={styles.notifyInputs}>
                            <input
                            type="text"
                            placeholder="Title (optional)"
                            value={notifyDraft[o._id]?.title || ""}
                            onChange={(e) => setNotifyDraft(p => ({ ...p, [o._id]: { ...(p[o._id] || {}), title: e.target.value } }))}
                            />
                            <textarea
                            placeholder="Message to customer..."
                            value={notifyDraft[o._id]?.message || ""}
                            onChange={(e) => setNotifyDraft(p => ({ ...p, [o._id]: { ...(p[o._id] || {}), message: e.target.value } }))}
                            />
                            <button onClick={() => handleSendNotification(o._id)} disabled={loading}>Send Update</button>
                        </div>
                    </div>

                    <div className={styles.itemsSection}>
                        <p className={styles.itemsTitle}>Order Items</p>
                        <div className={styles.itemsGrid}>
                        {o.items.map((it, idx) => (
                            <div key={idx} className={styles.itemMiniCard}>
                            <img src={it?.menuItem?.image} alt={it?.menuItem?.name} className={styles.thumb} />
                            <div className={styles.itemInfo}>
                                <div className={styles.itemName}>{it?.menuItem?.name}</div>
                                <div className={styles.itemMeta}>Qty: <strong>{it?.quantity}</strong> • ৳{it?.menuItem?.price}</div>
                            </div>
                            </div>
                        ))}
                        </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;