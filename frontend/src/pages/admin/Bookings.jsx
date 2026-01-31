import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";
import styles from "./Bookings.module.css";

const Bookings = () => {
  const { axios, loading, setLoading } = useContext(AppContext);
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get("/api/booking/bookings");
      if (data.success) setBookings(data.bookings);
      else toast.error(data.message);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      setLoading(true);
      const { data } = await axios.put(`/api/booking/status/${id}`, { status });
      if (data.success) {
        toast.success(data.message);
        fetchBookings();
      } else toast.error(data.message);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>All Bookings</h1>
        <div className={styles.card}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Date</th>
                <th>Time</th>
                <th>Guests</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td>{b.name}</td>
                  <td>{b.phone}</td>
                  <td>{new Date(b.date).toLocaleDateString()}</td>
                  <td>{b.time}</td>
                  <td>{b.numberOfPeople}</td>
                  <td>
                    <select
                      className={styles.select}
                      value={b.status}
                      disabled={loading}
                      onChange={(e) => updateStatus(b._id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
