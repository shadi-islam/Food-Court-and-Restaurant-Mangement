import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import styles from "./BookTable.module.css";

const BookTable = () => {
  const { axios, navigate } = useContext(AppContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    numberOfPeople: "",
    date: "",
    time: "",
    note: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/api/booking/create", formData);
      if (data.success) {
        toast.success(data.message);
        navigate("/my-bookings");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <header className={styles.header}>
          <h2 className={styles.title}>Book a Table</h2>
          <p className={styles.subtitle}>
            Reserve your table in advance and enjoy a seamless dining experience.
          </p>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.grid2}>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              className={styles.input}
              required
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your Email"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.grid2}>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              className={styles.input}
              required
            />
            <input
              type="number"
              name="numberOfPeople"
              value={formData.numberOfPeople}
              onChange={handleChange}
              placeholder="Guests"
              min="1"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.grid2}>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={styles.input}
              required
            />
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>

          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            placeholder="Special requests (optional)"
            rows={3}
            className={styles.textarea}
          />

          <button type="submit" className={styles.submit}>
            Confirm Booking
          </button>
        </form>
      </div>
    </section>
  );
};

export default BookTable;
