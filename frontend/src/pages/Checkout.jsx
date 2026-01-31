import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { Wallet, CreditCard } from "lucide-react";
import styles from "./Checkout.module.css";

const Checkout = () => {
  const { totalPrice, axios, navigate, tableNumber, user } = useContext(AppContext);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!tableNumber) return toast.error("Please enter via a table QR link");
    if (!user) return toast.error("Please login to place an order");

    try {
      setLoading(true);

      if (paymentMethod === "Online") {
        navigate("/payment-demo", { state: { tableNumber } });
        return;
      }

      const { data } = await axios.post("/api/order/place", {
        tableNumber,
        paymentMethod: "Cash",
        paymentStatus: "Unpaid",
      });

      if (data.success) {
        toast.success(data.message);
        navigate("/my-orders");
      } else toast.error(data.message);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Checkout</h2>
            <p className={styles.subTitle}>Review your total and choose payment.</p>
          </div>

          <div className={styles.tablePill}>
            <span className={styles.tableLabel}>Table</span>
            <strong className={styles.tableValue}>{tableNumber || "-"}</strong>
          </div>
        </div>

        {/* Summary */}
        <div className={styles.summary}>
          <div className={styles.summaryRow}>
            <span className={styles.muted}>Total Amount</span>
            <span className={styles.total}>$ {totalPrice}</span>
          </div>
          <div className={styles.divider} />
          <p className={styles.note}>
            Orders will be sent to the kitchen after confirmation.
          </p>
        </div>

        {/* Methods */}
        <h3 className={styles.sectionTitle}>Payment Method</h3>

        <div className={styles.methods}>
          <label
            className={`${styles.methodCard} ${
              paymentMethod === "Cash" ? styles.active : ""
            }`}
          >
            <input
              className={styles.radio}
              type="radio"
              name="payment"
              value="Cash"
              checked={paymentMethod === "Cash"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <div className={styles.methodIcon}>
              <Wallet size={18} />
            </div>
            <div className={styles.methodText}>
              <p className={styles.methodTitle}>Cash</p>
              <p className={styles.methodDesc}>Pay at the counter after dining.</p>
            </div>
          </label>

          <label
            className={`${styles.methodCard} ${
              paymentMethod === "Online" ? styles.active : ""
            }`}
          >
            <input
              className={styles.radio}
              type="radio"
              name="payment"
              value="Online"
              checked={paymentMethod === "Online"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <div className={styles.methodIcon}>
              <CreditCard size={18} />
            </div>
            <div className={styles.methodText}>
              <p className={styles.methodTitle}>Online</p>
              <p className={styles.methodDesc}>Demo SSLCommerz checkout flow.</p>
            </div>
          </label>
        </div>

        {/* Action */}
        <button
          onClick={handleCheckout}
          className={styles.confirmBtn}
          disabled={loading || !user}
        >
          {!user ? "Please Login to Checkout" : loading ? "Placing Order..." : "Confirm Order"}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
