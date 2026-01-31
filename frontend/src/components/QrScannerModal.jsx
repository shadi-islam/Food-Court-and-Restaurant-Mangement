import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import styles from "./QrScannerModal.module.css";

const QrScannerModal = ({ onResult, onClose }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 260, height: 260 },
        rememberLastUsedCamera: true,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        scanner
          .clear()
          .then(() => onResult(decodedText))
          .catch(() => onResult(decodedText));
      },
      () => {
        // ignore continuous scan errors
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [onResult]);

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label="QR Scanner">
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.titleBlock}>
            <div className={styles.kicker}>Secure Table Entry</div>
            <h3 className={styles.title}>Scan your Table QR</h3>
            <p className={styles.subtitle}>
              Point your camera at the QR code on your table. You’ll enter instantly—no login needed.
            </p>

            <div className={styles.trustRow} aria-label="Trust indicators">
              <span className={styles.trustPill}>🔒 Private</span>
              <span className={styles.trustPill}>⚡ Fast</span>
              <span className={styles.trustPill}>✅ Verified Table</span>
            </div>
          </div>

          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close scanner">
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.scannerFrame}>
            <div className={styles.scannerHeader}>
              <span className={styles.scannerDot} aria-hidden="true" />
              <span className={styles.scannerText}>Live Camera Scan</span>
            </div>

            <div className={styles.readerWrap}>
              <div id="qr-reader" className={styles.reader} />
            </div>

            <div className={styles.helper}>
              <span className={styles.helperIcon} aria-hidden="true">💡</span>
              <span>
                If the camera doesn’t open, use <strong>HTTPS</strong> and allow camera permission.
              </span>
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.secondaryBtn} onClick={onClose}>
              Cancel
            </button>
            <div className={styles.footerNote}>
              Your camera feed is used only for scanning the QR code.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrScannerModal;
