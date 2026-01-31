import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { MessageSquare, Star, User, Clock } from "lucide-react";
import styles from "./Feedback.module.css";

const Feedback = () => {
  const { axios } = useContext(AppContext);
  const [reviews, setReviews] = useState([]);

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get("/api/feedback/all");
      if (data.success) setReviews(data.feedback);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <MessageSquare className={styles.titleIcon} size={24} />
          <h1 className={styles.title}>Customer Feedback</h1>
        </div>
        <div className={styles.countBadge}>{reviews.length} Reviews</div>
      </header>

      {reviews.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><MessageSquare size={40} /></div>
          <p>No feedback received yet.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {reviews.map((r) => (
            <div key={r._id} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.userSection}>
                  <div className={styles.avatar}>
                    {r.user?.name ? r.user.name.charAt(0).toUpperCase() : <User size={16} />}
                  </div>
                  <div>
                    <div className={styles.name}>{r.user?.name || "Guest User"}</div>
                    <div className={styles.date}>
                      <Clock size={12} />
                      {new Date(r.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
                {typeof r.rating === "number" && (
                  <div className={styles.ratingBadge}>
                    <Star size={12} fill="currentColor" />
                    <span>{r.rating}</span>
                  </div>
                )}
              </div>

              <div className={styles.content}>
                <p className={styles.text}>{r.message}</p>
              </div>

              <div className={styles.cardFooter}>
                <span className={styles.timestamp}>
                  {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Feedback;