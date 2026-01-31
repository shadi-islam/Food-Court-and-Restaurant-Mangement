import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import styles from "./MyBookings.module.css";

const MyBookings = () => {
  const { axios } = useContext(AppContext);
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get("/api/booking/my-bookings");
      if (data.success) setBookings(data.bookings);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const badgeClass = (status) => {
    if (status === "Pending") return styles.badgePending;
    if (status === "Approved") return styles.badgeApproved;
    return styles.badgeRejected;
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h2 className={styles.title}>My Bookings</h2>

        {bookings.length === 0 ? (
          <div className={styles.empty}>
            <p>You don’t have any bookings yet.</p>
          </div>
        ) : (
          <div className={styles.list}>
            {bookings.map((booking) => (
              <div key={booking._id} className={styles.card}>
                <div className={styles.rowTop}>
                  <h3 className={styles.name}>{booking.name}</h3>
                  <span
                    className={`${styles.badge} ${badgeClass(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className={styles.grid}>
                  <p>
                    <span className={styles.label}>Phone</span>
                    {booking.phone}
                  </p>
                  <p>
                    <span className={styles.label}>Date</span>
                    {new Date(booking.date).toLocaleDateString()}
                  </p>
                  <p>
                    <span className={styles.label}>Time</span>
                    {booking.time}
                  </p>
                  <p>
                    <span className={styles.label}>Guests</span>
                    {booking.numberOfPeople}
                  </p>
                </div>

                {booking.note && (
                  <div className={styles.note}>
                    <span className={styles.label}>Note</span>
                    {booking.note}
                  </div>
                )}

                <div className={styles.meta}>
                  Booked on{" "}
                  {new Date(booking.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
