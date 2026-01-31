import { useContext, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { ArrowLeft, CheckCircle, ShoppingCart, XCircle } from "lucide-react";
import styles from "./MenuDetails.module.css";

const MenuDetails = () => {
  const { id } = useParams();
  const { menus, navigate, addToCart } = useContext(AppContext);
  const [quantity, setQuantity] = useState(1);

  const menu = menus.find((item) => item._id === id);

  const total = useMemo(() => {
    const price = Number(menu?.price || 0);
    return Math.max(1, quantity) * price;
  }, [menu, quantity]);

  if (!menu) {
    return (
      <div className={styles.notFound}>
        <div className={styles.notFoundCard}>
          <h2 className={styles.notFoundTitle}>Menu not found</h2>
          <p className={styles.notFoundText}>
            The item you're looking for doesn't exist.
          </p>
          <button onClick={() => navigate("/menu")} className={styles.backBtn}>
            Back to menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.containerTop}>
        <button onClick={() => navigate("/menu")} className={styles.backLink}>
          <ArrowLeft className={styles.backIcon} />
          <span>Back to menu</span>
        </button>
      </div>

      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Left: media */}
          <div className={styles.media}>
            <div className={styles.sticky}>
              <div className={styles.imageCard}>
                <img src={menu.image} alt={menu.name} className={styles.image} />

                <div className={styles.badgeWrap}>
                  {menu.isAvailable ? (
                    <div className={styles.badgeAvailable}>
                      <CheckCircle className={styles.badgeIcon} />
                      <span>Available</span>
                    </div>
                  ) : (
                    <div className={styles.badgeUnavailable}>
                      <XCircle className={styles.badgeIcon} />
                      <span>Unavailable</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: details */}
          <div className={styles.details}>
            <div className={styles.head}>
              <h1 className={styles.title}>{menu.name}</h1>

              <div className={styles.priceRow}>
                <span className={styles.price}>${Number(menu.price).toFixed(2)}</span>
                <span className={styles.per}>per item</span>
              </div>
            </div>

            <div className={styles.descCard}>
              <h3 className={styles.descTitle}>Description</h3>
              <p className={styles.desc}>{menu.description}</p>
            </div>

            <div className={styles.purchaseCard}>
              <div className={styles.purchaseTop}>
                <div>
                  <p className={styles.label}>Quantity</p>

                  <div className={styles.qtyRow}>
                    <button
                      type="button"
                      className={styles.qtyBtn}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>

                    <span className={styles.qty}>{quantity}</span>

                    <button
                      type="button"
                      className={styles.qtyBtn}
                      onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className={styles.totalBox}>
                  <p className={styles.label}>Total</p>
                  <p className={styles.total}>${total.toFixed(2)}</p>
                </div>
              </div>

              <button
                disabled={!menu.isAvailable}
                onClick={() => addToCart(menu._id, quantity)}
                className={menu.isAvailable ? styles.addBtn : styles.addBtnDisabled}
              >
                <ShoppingCart className={styles.cartIcon} />
                {menu.isAvailable ? "Add to cart" : "Unavailable"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuDetails;
