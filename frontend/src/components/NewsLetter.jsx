import styles from "./NewsLetter.module.css";

export default function NewsLetter() {
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
                Subscribe to our newsletter in order not to miss new arrivals
                <br /> promotions and discounts of our store
              </span>

              <form
                className={styles.formWrap}
                onSubmit={(e) => e.preventDefault()}
              >
                <div className={styles.inputGroup}>
                  <input
                    type="email"
                    className={styles.input}
                    placeholder="Enter email"
                    autoComplete="email"
                  />
                  <button className={styles.button} type="submit">
                    Subscribe
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
