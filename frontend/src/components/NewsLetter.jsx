import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./NewsLetter.module.css";
import toast from "react-hot-toast";

export default function NewsLetter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!consent) {
      toast.error("Please agree to receive promotional emails");
      return;
    }

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      // Store subscription locally or send to backend
      // Example: await axios.post('/api/newsletter/subscribe', { email });
      toast.success("Thank you for subscribing!");
      setEmail("");
      setConsent(false);
    } catch (error) {
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.section} aria-label="Newsletter subscription">
      <div className={styles.row}>
        <div className={styles.col}>
          <div className={styles.card}>
            <div className={styles.center}>
              <img
                src="https://i.imgur.com/Dh7U4bp.png"
                alt="Newsletter"
                className={styles.image}
              />

              <span className={styles.text}>
                Subscribe to our newsletter to receive updates about new arrivals,
                <br /> promotions and special offers
              </span>

              <form
                className={styles.formWrap}
                onSubmit={handleSubscribe}
              >
                <div className={styles.inputGroup}>
                  <input
                    type="email"
                    className={styles.input}
                    placeholder="Enter your email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button 
                    className={styles.button} 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Subscribing..." : "Subscribe"}
                  </button>
                </div>

                {/* Explicit consent checkbox */}
                <div className={styles.consentGroup}>
                  <label className={styles.consentLabel}>
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className={styles.checkbox}
                    />
                    <span>
                      I agree to receive promotional emails. I can unsubscribe anytime.{" "}
                      <Link to="/privacy-policy" className={styles.link}>
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

