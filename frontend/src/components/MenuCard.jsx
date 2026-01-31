import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { ShoppingCart, ArrowRight } from "lucide-react";
import styles from "./MenuCard.module.css";

const MenuCard = ({ menu }) => {
  const { navigate, addToCart } = useContext(AppContext);

  const isAvailable = !!menu?.isAvailable;

  return (
    <article className={`${styles.cardHover} ${!isAvailable ? styles.isDisabled : ""}`}>
      {/* Background image */}
      <img src={menu.image} alt={menu.name} className={styles.bgImage} />

      {/* Main content "wave panel" */}
      <div className={styles.content}>
        <h3 className={styles.title}>
          {menu.name}{" "}
          {!isAvailable ? <span className={styles.unavailable}>Unavailable</span> : null}
        </h3>

        <p className={styles.text}>{menu.description}</p>

        <div className={styles.row}>
          <div className={styles.price}>
            <span className={styles.currency}>$</span>
            {Number(menu.price).toFixed(2)}
          </div>

          <button
            type="button"
            className={styles.cartBtn}
            disabled={!isAvailable}
            onClick={() => addToCart(menu._id)}
          >
            <ShoppingCart className={styles.icon} />
            Add
          </button>
        </div>

        {/* revealed on hover */}
        <button
          type="button"
          className={styles.link}
          onClick={() => navigate(`/menu-details/${menu._id}`)}
        >
          <span>View Details</span>
          <ArrowRight className={styles.linkIcon} />
        </button>
      </div>

      {/* Extra panel revealed from bottom */}
      <div className={styles.extra}>
        <h4 className={styles.extraTitle}>
          Tap to view <span>ingredients</span> & <span>details</span>
        </h4>
        <button
          type="button"
          className={styles.extraBtn}
          onClick={() => navigate(`/menu-details/${menu._id}`)}
        >
          Open Details
        </button>
      </div>

      {!isAvailable && <div className={styles.dim} aria-hidden="true" />}
    </article>
  );
};

export default MenuCard;
