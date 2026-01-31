import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import styles from "./TableEntry.module.css";

const TableEntry = () => {
  const { tableNumber, setTableNumber, user, axios, setUser } =
    useContext(AppContext);

  const params = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [localTable, setLocalTable] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);

  const toastShownRef = useRef(false);
  const timerRef = useRef(null);
  const progressRef = useRef(null);

  // ✅ detect table from QR
  const resolvedTable = useMemo(() => {
    const fromPath = params.tableNumber;
    const fromQuery = searchParams.get("table");
    return fromPath || fromQuery ? String(fromPath || fromQuery) : "";
  }, [params.tableNumber, searchParams]);

  const goMenu = () => navigate("/menu", { replace: true });

  // ✅ Load table from localStorage if no QR table
  useEffect(() => {
    if (resolvedTable) return; // QR takes priority
    const saved = localStorage.getItem("tableNumber");
    if (saved) {
      setLocalTable(saved);
      setTableNumber(saved);
    }
  }, [resolvedTable, setTableNumber]);

  // ✅ If QR has a table, set it + persist it + toast
  useEffect(() => {
    if (!resolvedTable) return;

    setLocalTable(resolvedTable);
    setTableNumber(resolvedTable);
    localStorage.setItem("tableNumber", resolvedTable);

    if (!toastShownRef.current) {
      toastShownRef.current = true;
      toast.success(`Welcome! Table ${resolvedTable} detected`);
    }
  }, [resolvedTable, setTableNumber]);

  // ✅ Auto guest login + 1s progress + redirect
  useEffect(() => {
    // Only auto-run when table exists AND user not logged in
    if (!tableNumber) return;
    if (user) return;
    if (busy) return;

    const run = async () => {
      try {
        setBusy(true);
        setProgress(0);

        const { data } = await axios.post("/api/auth/guest");
        if (!data?.success) {
          setBusy(false);
          return;
        }

        setUser(data.user);

        // progress ring for ~1s
        const start = performance.now();
        const duration = 1000;

        const tick = (now) => {
          const p = Math.min(1, (now - start) / duration);
          setProgress(Math.round(p * 100));
          if (p < 1) {
            progressRef.current = requestAnimationFrame(tick);
          } else {
            timerRef.current = setTimeout(() => {
              goMenu();
            }, 50);
          }
        };

        progressRef.current = requestAnimationFrame(tick);
      } catch (e) {
        setBusy(false);
      }
    };

    run();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressRef.current) cancelAnimationFrame(progressRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableNumber, user]);

  const onSubmitTable = (e) => {
    e.preventDefault();
    const n = Number(localTable);
    if (!Number.isFinite(n) || n < 1) {
      toast.error("Please enter a valid table number");
      return;
    }
    const t = String(n);
    setTableNumber(t);
    localStorage.setItem("tableNumber", t);
    toast.success(`Table ${t} saved`);
  };

  const onClear = () => {
    localStorage.removeItem("tableNumber");
    setTableNumber("");
    setLocalTable("");
    toast("Table cleared");
  };

  // progress ring math
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const dash = (progress / 100) * circumference;

  return (
    <div className={styles.page}>
      <div className={styles.bgGlow} aria-hidden="true" />

      <div className={styles.card}>
        <div className={styles.head}>
          <h1 className={styles.title}>
            {tableNumber ? `Table ${tableNumber}` : "Enter Table Number"}
          </h1>
          <p className={styles.subtitle}>
            {tableNumber
              ? user
                ? "Taking you to the menu…"
                : "Starting guest session…"
              : "Enter your table number or scan the QR code."}
          </p>
        </div>

        {!tableNumber && (
          <form onSubmit={onSubmitTable} className={styles.formRow}>
            <input
              className={styles.input}
              value={localTable}
              onChange={(e) => setLocalTable(e.target.value)}
              placeholder="Table number"
              inputMode="numeric"
            />
            <button className={styles.primary} type="submit">
              Continue
            </button>
          </form>
        )}

        {tableNumber && (
          <div className={styles.actions}>
            <button className={styles.primary} disabled>
              <span className={styles.primaryRow}>
                {busy ? "Starting…" : "Continue"}
                {busy && (
                  <span className={styles.ringWrap} aria-hidden="true">
                    <svg
                      className={styles.ring}
                      width="44"
                      height="44"
                      viewBox="0 0 44 44"
                    >
                      <circle
                        className={styles.ringTrack}
                        cx="22"
                        cy="22"
                        r={radius}
                      />
                      <circle
                        className={styles.ringFill}
                        cx="22"
                        cy="22"
                        r={radius}
                        strokeDasharray={`${dash} ${circumference - dash}`}
                      />
                    </svg>
                    <span className={styles.ringText}>{progress}%</span>
                  </span>
                )}
              </span>
            </button>

            <div className={styles.secondaryRow}>
              <button
                className={styles.secondary}
                onClick={() => navigate("/login")}
                disabled={busy}
              >
                Login
              </button>
              <button
                className={styles.secondary}
                onClick={() => navigate("/signup")}
                disabled={busy}
              >
                Sign up
              </button>
            </div>

            <button
              type="button"
              className={styles.clearBtn}
              onClick={onClear}
              disabled={busy}
            >
              Clear saved table
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableEntry;
