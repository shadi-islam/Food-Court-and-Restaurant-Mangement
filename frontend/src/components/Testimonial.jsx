import styles from "./Testimonial.module.css";

const TESTIMONIALS = [
  {
    name: "Shadi Islam",
    role: "Content Creator",
    avatar:
     "https://shadiportfolioo.netlify.app/assets/DSC_2772.JPG",
    quote:
      "The food quality and service were outstanding. Everything arrived fresh, hot, and beautifully presented.",
    rating: 5,
  },
  {
    name: "Ted Mosby",
    role: "Architect",
    avatar:
      "https://upload.wikimedia.org/wikipedia/en/e/e0/Ted_Mosby.jpg",
    quote:
      "Loved the ambience and the menu variety. Ordering was seamless and updates were instant.",
    rating: 5,
  },
  {
    name: "Barney Stinson",
    role: "Marketing Manager",
    avatar:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHwQueh-Q0CwjioXKrSIFCF8lmqBReEESPN3zTWeaObJlVK70CfyuQqFca1DKrg2aG8ZIRD98qhn0FlTUVVM_JsQX_TKZbQuxosdIl7A&s=10",
    quote:
      "Great experience from start to finish. The real-time order status is super helpful.",
    rating: 5,
  },
];

function Stars({ count = 5 }) {
  return (
    <div className={styles.stars} aria-label={`${count} star rating`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={i < count ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.star}
          aria-hidden="true"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonial() {
  return (
    <section className={styles.section} aria-label="Customer testimonials">
      <div className={styles.container}>
        <header className={styles.header}>
          <p className={styles.kicker}>Testimonials</p>
          <h2 className={styles.title}>
            People <span className={styles.accent}>love</span> ordering with us
          </h2>
          <p className={styles.subtitle}>
            Real reviews from customers who tried our menu and enjoyed the experience.
          </p>
        </header>

        <div className={styles.grid}>
          {TESTIMONIALS.map((t) => (
            <article key={t.name} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.avatarWrap}>
                  <img className={styles.avatar} src={t.avatar} alt={t.name} />
                </div>

                <div className={styles.identity}>
                  <h3 className={styles.name}>{t.name}</h3>
                  <p className={styles.role}>{t.role}</p>
                </div>

                <Stars count={t.rating} />
              </div>

              <p className={styles.quote}>
                <span className={styles.quoteMark} aria-hidden="true">“</span>
                {t.quote}
                <span className={styles.quoteMark} aria-hidden="true">”</span>
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
