import { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../../context/AppContext";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  const { axios } = useContext(AppContext);

  const [today, setToday] = useState(0);
  const [month, setMonth] = useState(0);
  const [range, setRange] = useState(0);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loadingBase, setLoadingBase] = useState(false);
  const [loadingRange, setLoadingRange] = useState(false);
  const [error, setError] = useState("");

  const isRangeValid = useMemo(() => {
    if (!startDate || !endDate) return false;
    return new Date(startDate) <= new Date(endDate);
  }, [startDate, endDate]);

  const fetchBase = async () => {
    try {
      setLoadingBase(true);
      setError("");
      const [t, m] = await Promise.all([
        axios.get("/api/analytics/revenue/today"),
        axios.get("/api/analytics/revenue/month"),
      ]);

      if (t.data?.success) setToday(t.data.total || 0);
      if (m.data?.success) setMonth(m.data.total || 0);
    } catch (e) {
      console.log(e);
      setError("Failed to load analytics.");
    } finally {
      setLoadingBase(false);
    }
  };

  const fetchRange = async () => {
    if (!startDate || !endDate) return;
    if (!isRangeValid) {
      setError("End date can’t be earlier than start date.");
      return;
    }

    try {
      setLoadingRange(true);
      setError("");
      const { data } = await axios.get(
        `/api/analytics/revenue/range?startDate=${encodeURIComponent(
          startDate
        )}&endDate=${encodeURIComponent(endDate)}`
      );
      if (data?.success) setRange(data.total || 0);
      else setError(data?.message || "Failed to calculate range revenue.");
    } catch (e) {
      console.log(e);
      setError("Failed to calculate range revenue.");
    } finally {
      setLoadingRange(false);
    }
  };

  useEffect(() => {
    fetchBase();
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <div>
          <h1 className={styles.title}>Analytics</h1>
          <p className={styles.subtitle}>Revenue overview (paid orders only)</p>
        </div>

        <button
          type="button"
          onClick={fetchBase}
          className={styles.ghostBtn}
          disabled={loadingBase}
        >
          {loadingBase ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && <div className={styles.alert}>{error}</div>}

      <div className={styles.grid}>
        <div className={`${styles.metric} ${styles.metricToday}`}>
          <div className={styles.metricLabel}>Revenue (Today)</div>
          <div className={styles.metricValue}>
            ৳ {Number(today).toLocaleString()}
          </div>
          <div className={styles.metricHint}>
            {loadingBase ? "Loading..." : "Updated from server"}
          </div>
        </div>

        <div className={`${styles.metric} ${styles.metricMonth}`}>
          <div className={styles.metricLabel}>Revenue (This Month)</div>
          <div className={styles.metricValue}>
            ৳ {Number(month).toLocaleString()}
          </div>
          <div className={styles.metricHint}>Monthly total (paid)</div>
        </div>

        <div className={`${styles.metric} ${styles.metricRange}`}>
          <div className={styles.metricLabel}>Revenue (Custom Range)</div>
          <div className={styles.metricValue}>
            ৳ {Number(range).toLocaleString()}
          </div>
          <div className={styles.metricHint}>Pick dates below</div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>Custom Date Range</h2>
          <span className={styles.cardNote}>Counts only paid orders</span>
        </div>

        <form
          className={styles.rangeRow}
          onSubmit={(e) => {
            e.preventDefault();
            fetchRange();
          }}
        >
          <div className={styles.field}>
            <label className={styles.label}>Start</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>End</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={styles.input}
            />
          </div>

          <button
            type="submit"
            className={styles.button}
            disabled={!startDate || !endDate || !isRangeValid || loadingRange}
            title={!isRangeValid ? "End date must be after start date" : ""}
          >
            {loadingRange ? "Calculating..." : "Calculate"}
          </button>
        </form>

        {!isRangeValid && startDate && endDate && (
          <p className={styles.helperError}>
            End date can’t be earlier than start date.
          </p>
        )}

        <p className={styles.note}>
          Tip: You can press <b>Enter</b> to calculate after selecting dates.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
