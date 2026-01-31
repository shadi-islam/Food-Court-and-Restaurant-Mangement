import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { X, Minus, Plus } from "lucide-react";
import toast from "react-hot-toast";
import styles from "./Cart.module.css";

const Cart = () => {
  const { cart, totalPrice, navigate, axios, fetchCartData } =
    useContext(AppContext);

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyCard}>
          <h2 className={styles.emptyTitle}>Your cart is empty</h2>
          <p className={styles.emptyText}>Add something tasty from the menu.</p>
          <button onClick={() => navigate("/menu")} className={styles.emptyBtn}>
            Browse Menus
          </button>
        </div>
      </div>
    );
  }

  const removeFromCart = async (menuId) => {
    try {
      const { data } = await axios.delete(`/api/cart/remove/${menuId}`);
      if (data.success) {
        toast.success(data.message);
        fetchCartData();
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to remove item");
    }
  };

  // ✅ Quantity update (tries to call API, if not available it will show error toast)
  const updateQty = async (menuId, nextQty) => {
    try {
      if (nextQty <= 0) {
        await removeFromCart(menuId);
        return;
      }

      // 👉 Use this endpoint if you have it:
      // PATCH /api/cart/update/:menuId  body: { quantity: nextQty }
      const { data } = await axios.patch(`/api/cart/update/${menuId}`, {
        quantity: nextQty,
      });

      if (data?.success) {
        fetchCartData();
      } else {
        toast.error(data?.message || "Quantity update failed");
      }
    } catch (err) {
      console.log(err);
      toast.error(
        "No quantity update API found. Add /api/cart/update/:menuId endpoint."
      );
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h2 className={styles.title}>Your Cart</h2>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thItem}>Item</th>
                <th className={styles.thCenter}>Qty</th>
                <th className={styles.thCenter}>Price</th>
                <th className={styles.thCenter}>Total</th>
                <th className={styles.thCenter}>Action</th>
              </tr>
            </thead>

            <tbody>
              {cart.items.map((item) => {
                const qty = item.quantity;
                const price = item.menuItem.price;
                const rowTotal = price * qty;

                return (
                  <tr key={item._id} className={styles.row}>
                    <td className={styles.itemCell}>
                      <img
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        className={styles.thumb}
                      />
                      <div className={styles.itemMeta}>
                        <span className={styles.itemName}>
                          {item.menuItem.name}
                        </span>
                      </div>
                    </td>

                    {/* ✅ Qty controls */}
                    <td className={styles.tdCenter}>
                      <div className={styles.qtyControl}>
                        <button
                          type="button"
                          className={styles.qtyBtn}
                          onClick={() => updateQty(item.menuItem._id, qty - 1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={16} />
                        </button>

                        <span className={styles.qtyNum}>{qty}</span>

                        <button
                          type="button"
                          className={styles.qtyBtn}
                          onClick={() => updateQty(item.menuItem._id, qty + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </td>

                    <td className={styles.tdCenter}>$ {price}</td>

                    <td className={styles.tdCenterStrong}>$ {rowTotal}</td>

                    <td className={styles.tdCenter}>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => removeFromCart(item.menuItem._id)}
                        aria-label="Remove item"
                        title="Remove"
                      >
                        <X />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className={styles.footer}>
          <h3 className={styles.total}>
            Total: <span className={styles.totalValue}>${totalPrice}</span>
          </h3>
          <button
            onClick={() => navigate("/checkout")}
            className={styles.checkoutBtn}
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
