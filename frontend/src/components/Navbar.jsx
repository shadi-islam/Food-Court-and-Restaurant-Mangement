// Navbar.jsx
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppContext } from "../context/AppContext";
import { Link, useLocation } from "react-router-dom";
import {
  Calendar,
  LogOut,
  Package,
  ShoppingCart,
  UserCircle,
  Menu as MenuIcon,
  X as CloseIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const { navigate, user, setUser, axios, cartCount, branding } = useContext(AppContext);
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Keep dropdown open while moving mouse from icon -> menu
  const profileRef = useRef(null);
  const closeTimer = useRef(null);

  const links = useMemo(
    () => [
      { to: "/", label: "Home" },
      { to: "/menu", label: "Menus" },
      { to: "/table", label: "Table Number" },
      { to: "/contact", label: "Contact" },
    ],
    []
  );

  const isActive = (to) => {
    if (to === "/") return location.pathname === "/";
    return location.pathname.startsWith(to);
  };

  const logout = async () => {
    try {
      const { data } = await axios.post("/api/auth/logout");
      if (data.success) {
        setUser(null);
        toast.success(data.message);
        navigate("/");
      } else toast.error(data.message || "Logout failed");
    } catch (e) {
      console.log(e);
      toast.error("Logout failed");
    }
  };

  const openProfile = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setProfileOpen(true);
  };

  const closeProfileWithDelay = () => {
    closeTimer.current = setTimeout(() => setProfileOpen(false), 160);
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 860) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header className={styles.header} id="top">
      <nav className={`${styles.nav} ${open ? styles.open : ""}`}>
        {/* Brand */}
        <Link
          to="/"
          className={styles.brand}
          onClick={() => setOpen(false)}
          aria-label="Go to home"
        >
          <span className={styles.brandIcon} aria-hidden="true">
            <img
              src="./src/assets/logo2.png"
              alt={`${branding?.siteName || "Restaurant"} Logo`}
              className={styles.brandLogo}
            />
          </span>
          <span className={styles.brandName}>{branding?.siteName || "Restaurant"}</span>
        </Link>

        {/* Menu */}
        <ul className={styles.menu} aria-label="Primary navigation">
          {links.map((l) => (
            <li key={l.to} className={styles.menuItem}>
              <Link
                to={l.to}
                className={`${styles.menuLink} ${
                  isActive(l.to) ? styles.active : ""
                }`}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate("/cart");
            }}
            className={styles.cartBtn}
            aria-label="Open cart"
          >
            <ShoppingCart size={20} />
            <span className={styles.badge}>{cartCount > 0 ? cartCount : 0}</span>
          </button>

          {/* Profile / Login */}
          <div
            className={styles.profileWrap}
            ref={profileRef}
            onMouseEnter={openProfile}
            onMouseLeave={closeProfileWithDelay}
          >
            {user ? (
              <>
                <button
                  type="button"
                  className={styles.profileBtn}
                  onClick={() => setProfileOpen((s) => !s)}
                  aria-label="Open profile"
                  aria-expanded={profileOpen}
                >
                  <UserCircle size={28} />
                </button>

                {profileOpen && (
                  <div
                    className={styles.dropdown}
                    role="menu"
                    onMouseEnter={openProfile}
                    onMouseLeave={closeProfileWithDelay}
                  >
                    <Link
                      to="/table"
                      className={styles.dropdownItem}
                      onClick={() => {
                        setProfileOpen(false);
                        setOpen(false);
                      }}
                      role="menuitem"
                    >
                      <Calendar size={18} />
                      Change Table
                    </Link>

                    <Link
                      to="/my-orders"
                      className={styles.dropdownItem}
                      onClick={() => {
                        setProfileOpen(false);
                        setOpen(false);
                      }}
                      role="menuitem"
                    >
                      <Package size={18} />
                      My Orders
                    </Link>

                    <button
                      type="button"
                      onClick={async () => {
                        await logout();
                        setProfileOpen(false);
                        setOpen(false);
                      }}
                      className={`${styles.dropdownItem} ${styles.logout}`}
                      role="menuitem"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                type="button"
                className={styles.loginBtn}
                onClick={() => {
                  setOpen(false);
                  navigate("/login");
                }}
              >
                Login
              </button>
            )}
          </div>

          {/* ✅ Mobile toggle moved here so in mobile it appears RIGHTMOST */}
          <button
            type="button"
            className={styles.mobileToggle}
            onClick={() => setOpen((s) => !s)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile backdrop (tap outside to close) */}
      {open && (
        <button
          className={styles.backdrop}
          onClick={() => setOpen(false)}
          aria-label="Close menu backdrop"
        />
      )}
    </header>
  );
};

export default Navbar;
