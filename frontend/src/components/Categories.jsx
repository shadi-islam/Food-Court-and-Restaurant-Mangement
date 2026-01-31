import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import styles from "./Categories.module.css";

const Categories = () => {
  const { navigate, categories } = useContext(AppContext);
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>
          Explore Our <span className={styles.accent}>Categories</span>
        </h2>
        <p className={styles.subtitle}>
          Discover delicious dishes from our carefully curated categories
        </p>

        <div className={styles.grid}>
          {categories.map((cat) => (
            <button
              key={cat._id}
              type="button"
              className={styles.item}
              onClick={() => {
                // Keeping existing navigation behavior minimal & safe.
                // If you want category-specific filtering, we can wire it in.
                navigate("/menu");
              }}
            >
              <div className={styles.picWrap}>
                <div className={styles.picFrame}>
                  <img
                    src={cat.image}
                    alt=""
                    className={styles.pic}
                  />
                </div>
                <div className={styles.overlay} />
              </div>
              <div className={styles.caption}>
                <h3 className={styles.name}>{cat.name}</h3>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Categories;
