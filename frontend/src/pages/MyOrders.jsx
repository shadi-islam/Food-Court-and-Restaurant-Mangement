import { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../context/AppContext";
import {
  CheckCircle2,
  ChefHat,
  Soup,
  UtensilsCrossed,
  Clock3,
  Bell,
} from "lucide-react";
import toast from "react-hot-toast";
import styles from "./MyOrders.module.css";

const MyOrders = () => {
  const { axios, socket } = useContext(AppContext);
  const [orders, setOrders] = useState([]);

  const steps = useMemo(
    () => [
      { key: "Approved", label: "Approved", icon: CheckCircle2 },
      { key: "Processing in Kitchen", label: "In Kitchen", icon: ChefHat },
      { key: "Ready to Serve", label: "Ready", icon: Soup },
      { key: "Served", label: "Served", icon: UtensilsCrossed },
    ],
    []
  );

  const fetchMyOrders = async () => {
    try {
      const { data } = await axios.get("/api/order/my-orders");
      if (data?.success) {
        setOrders(data.orders || []);
        return;
      }
    } catch (error) {
      // if unauthorized or no auth, we'll try table lookup
      // console.log(error);
    }

    // fallback for guest sessions: try to fetch by table number from localStorage
    try {
      const tableNumber = localStorage.getItem("tableNumber");
      if (!tableNumber) return setOrders([]);
      const { data } = await axios.get(`/api/order/table/${tableNumber}`);
      if (data?.success) setOrders(data.orders || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onStatus = ({ orderId, status }) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o))
      );
    };

    const onNotification = ({ orderId, message, type }) => {
      if (type === "ready") {
        toast.success(message, { duration: 5000, icon: "🔔" });
      }
    };

    const onPaymentStatus = ({ orderId, paymentStatus }) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, paymentStatus } : o))
      );
    };

    const onDiscount = ({ orderId, discount, totalAmount }) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, discount, totalAmount } : o))
      );
    };

    const onEstimatedTime = ({ orderId, estimatedTime }) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, estimatedTime } : o))
      );
    };

    socket.on("order:status", onStatus);
    socket.on("order:notification", onNotification);
    socket.on("order:paymentStatus", onPaymentStatus);
    socket.on("order:discount", onDiscount);
    socket.on("order:estimatedTime", onEstimatedTime);
    
    // subscribe to each order
    orders.forEach((o) => socket.emit("order:subscribe", { orderId: o._id }));

    return () => {
      socket.off("order:status", onStatus);
      socket.off("order:notification", onNotification);
      socket.off("order:paymentStatus", onPaymentStatus);
      socket.off("order:discount", onDiscount);
      socket.off("order:estimatedTime", onEstimatedTime);
    };
  }, [socket, orders]);

  const stepIndex = (status) => {
    const idx = steps.findIndex((s) => s.key === status);
    return idx === -1 ? 0 : idx;
  };

  const formatDateTime = (iso) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return "-";
    }
  };

  const getDiscountedTotal = (order) => {
    return order.totalAmount - (order.discount || 0);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>My Orders</h2>
            <p className={styles.subtitle}>
              Track your food status in real-time.
            </p>
          </div>
          <button className={styles.refreshBtn} onClick={fetchMyOrders}>
            <Clock3 size={16} />
            Refresh
          </button>
        </div>

        {orders.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyCard}>
              <h3 className={styles.emptyTitle}>No orders yet</h3>
              <p className={styles.emptyText}>
                Once you place an order, it will show up here with live status
                updates.
              </p>
            </div>
          </div>
        ) : (
          <div className={styles.list}>
            {orders.map((order) => {
              const idx = stepIndex(order.status);
              const progress = ((idx + 1) / steps.length) * 100;

              return (
                <article key={order._id} className={styles.card}>
                  {/* top row */}
                  <div className={styles.head}>
                    <div>
                      <div className={styles.orderTitle}>
                        Order <span className={styles.orderId}>#{order._id.slice(-6)}</span>
                        <span className={styles.dot}>•</span>
                        Table <span className={styles.tableNo}>{order.tableNumber}</span>
                      </div>
                      <div className={styles.meta}>
                        Placed: {formatDateTime(order.createdAt)}
                      </div>
                    </div>

                    <span className={styles.statusPill}>
                      {order.status || "Approved"}
                    </span>
                  </div>

                  {/* progress bar */}
                  <div className={styles.progressWrap}>
                    <div className={styles.progressTrack}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* stepper */}
                    <div className={styles.stepper}>
                      {steps.map((s, i) => {
                        const Icon = s.icon;
                        const state =
                          i < idx ? "done" : i === idx ? "active" : "todo";

                        return (
                          <div
                            key={s.key}
                            className={`${styles.step} ${styles[`step_${state}`]}`}
                          >
                            <div className={styles.stepIcon}>
                              <Icon size={16} />
                            </div>
                            <div className={styles.stepLabel}>{s.label}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Estimated Time Notice */}
                  {order.estimatedTime > 0 && (
                    <div style={{
                      background: "#e3f2fd",
                      border: "1px solid #90caf9",
                      borderRadius: "6px",
                      padding: "10px 12px",
                      margin: "12px 0",
                      fontSize: "13px",
                      color: "#1565c0",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}>
                      <Clock3 size={14} />
                      <span><strong>Estimated time:</strong> {order.estimatedTime} minutes</span>
                    </div>
                  )}

                  {/* Notification for Ready to Serve */}
                  {order.status === "Ready to Serve" && (
                    <div style={{
                      background: "#f3e5f5",
                      border: "1px solid #ce93d8",
                      borderRadius: "6px",
                      padding: "10px 12px",
                      margin: "12px 0",
                      fontSize: "13px",
                      color: "#7b1fa2",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}>
                      <Bell size={14} />
                      <span><strong>Your order is ready!</strong> Please come to the counter.</span>
                    </div>
                  )}

                  {/* details */}
                  <div className={styles.details}>
                    <div className={styles.detail}>
                      <div className={styles.label}>Payment</div>
                      <div className={styles.value}>
                        {order.paymentMethod} · <strong>{order.paymentStatus}</strong>
                      </div>
                    </div>

                    <div className={styles.detail}>
                      <div className={styles.label}>Total</div>
                      <div className={styles.valueStrong}>
                        ৳ {getDiscountedTotal(order)}
                        {order.discount > 0 && (
                          <span style={{ fontSize: "11px", color: "#999", marginLeft: "4px" }}>
                            (Discount: ৳{order.discount})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={styles.detail}>
                      <div className={styles.label}>Items</div>
                      <div className={styles.value}>{order.items?.length || 0}</div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
