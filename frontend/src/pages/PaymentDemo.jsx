import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { AppContext } from "../context/AppContext";
import styles from "./PaymentDemo.module.css";

const PaymentDemo = () => {
  const { axios, navigate, tableNumber: lockedTable } = useContext(AppContext);
  const { state } = useLocation();
  const [status, setStatus] = useState("processing");

  const tableNumber = state?.tableNumber || lockedTable;

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const transactionId = `DEMO-${Date.now()}`;
        const { data } = await axios.post("/api/order/place", {
          tableNumber,
          paymentMethod: "Online",
          paymentStatus: "Paid",
          transactionId,
        });
        if (data.success) {
          setStatus("success");
          toast.success("Payment successful (demo)");
          navigate("/my-orders", { replace: true });
        } else {
          setStatus("failed");
          toast.error(data.message);
        }
      } catch (e) {
        setStatus("failed");
        toast.error("Payment failed (demo)");
      }
    }, 1600);

    return () => clearTimeout(timer);
  }, [axios, navigate, tableNumber]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h2 className={styles.title}>SSLCommerz (Demo)</h2>
        <p className={styles.subtitle}>
          Simulating online payment for Table <strong>{tableNumber}</strong>...
        </p>

        <div className={styles.status}>
          {status === "processing" && <p>Processing...</p>}
          {status === "success" && <p>Success! Redirecting...</p>}
          {status === "failed" && <p>Failed. Please try again.</p>}
        </div>
      </div>
    </div>
  );
};

export default PaymentDemo;
