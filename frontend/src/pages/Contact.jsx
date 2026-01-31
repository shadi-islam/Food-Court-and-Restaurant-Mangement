import { useContext, useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import toast from "react-hot-toast";
import { AppContext } from "../context/AppContext";
import styles from "./Contact.module.css";

const Contact = () => {
  const { axios } = useContext(AppContext);

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [sending, setSending] = useState(false);

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSending(true);
      const { data } = await axios.post("/api/contact/send", form);

      if (data?.success) {
        toast.success(data.message || "Message sent!");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        toast.error(data?.message || "Failed to send.");
      }
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Failed to send.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* ...your hero stays same... */}

      <div className={styles.container}>
        <div className={styles.grid}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Send a message</h2>

            <form className={styles.form} onSubmit={onSubmit}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>Your name</label>
                  <input
                    name="name"
                    className={styles.input}
                    placeholder="John Doe"
                    value={form.name}
                    onChange={onChange}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Your email</label>
                  <input
                    name="email"
                    type="email"
                    className={styles.input}
                    placeholder="john@email.com"
                    value={form.email}
                    onChange={onChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Subject</label>
                <input
                  name="subject"
                  className={styles.input}
                  placeholder="How can we help?"
                  value={form.subject}
                  onChange={onChange}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Message</label>
                <textarea
                  name="message"
                  className={styles.textarea}
                  placeholder="Write your message..."
                  rows={5}
                  value={form.message}
                  onChange={onChange}
                  required
                />
              </div>

              <button className={styles.button} type="submit" disabled={sending}>
                {sending ? "Sending..." : "Send message"}
              </button>
            </form>
          </section>

          <aside className={styles.section}>
            {/* ... your info cards ... */}

            {/* ✅ Google Map iframe */}
            <div className={styles.mapCard}>
              <div className={styles.mapTop}>
                <div className={styles.mapTitle}>Find us on Google Maps</div>
                <div className={styles.mapSub}>Dhaka, Bangladesh</div>
              </div>

              <div className={styles.mapFrame}>
                <iframe
                  title="Google Map"
                  src="https://www.google.com/maps?q=Dhaka%2C%20Bangladesh&z=13&output=embed"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Contact;
