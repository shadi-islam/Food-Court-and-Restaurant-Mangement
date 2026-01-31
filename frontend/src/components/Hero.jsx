import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import styles from "./Hero.module.css";
import QrScannerModal from "../components/QrScannerModal";

const Hero = () => {
  const { navigate } = useContext(AppContext);
  const [scannerOpen, setScannerOpen] = useState(false);

  const handleQrResult = (text) => {
    setScannerOpen(false);

    // Accept formats like:
    // 1) https://yourdomain.com/table/12
    // 2) /table/12
    // 3) TABLE:12
    // 4) 12 (just table number)
    try {
      if (text.startsWith("http")) {
        const url = new URL(text);
        if (url.pathname.startsWith("/table/")) {
          navigate(url.pathname);
          return;
        }
      }

      if (text.startsWith("/table/")) {
        navigate(text);
        return;
      }

      if (text.toUpperCase().startsWith("TABLE:")) {
        const tableNo = text.split(":")[1]?.trim();
        if (tableNo) navigate(`/table/${tableNo}`);
        return;
      }

      // fallback: if it's just a number
      const maybeNumber = text.trim();
      if (/^\d+$/.test(maybeNumber)) {
        navigate(`/table/${maybeNumber}`);
        return;
      }

      alert("Invalid QR code. Please scan a Table QR.");
    } catch {
      alert("Could not read QR. Please try again.");
    }
  };

  return (
    <section
      className={styles.hero}
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1600&q=80')",
      }}
      aria-label="Restaurant hero"
    >
      <div className={styles.overlay} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.topRow}>
            <span className={styles.dot} aria-hidden="true" />
            <span className={styles.label}>Today’s kitchen is open</span>
          </div>

          <h1 className={styles.title}>
            Food that feels <span className={styles.accent}>fresh</span>.
            <br />
            Served fast, made right.
          </h1>

          <p className={styles.subtitle}>
            Browse the menu or scan your table QR to start ordering as a guest — no account needed.
          </p>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => navigate("/menu")}
            >
              View Menu
            </button>

            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => setScannerOpen(true)}
            >
              Scan to Enter Table
            </button>
          </div>

          <div className={styles.hint}>
            Tip: Open your camera to scan the Table <strong>QR Code</strong>, you’ll land directly on your table.
          </div>
        </div>
      </div>

      {scannerOpen && (
        <QrScannerModal
          onResult={handleQrResult}
          onClose={() => setScannerOpen(false)}
        />
      )}
    </section>
  );
};

export default Hero;
