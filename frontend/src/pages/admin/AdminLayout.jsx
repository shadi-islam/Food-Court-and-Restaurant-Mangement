import { useContext, useMemo, useState } from "react";
import { AppContext } from "../../context/AppContext";
import {
  Grid3X3,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Package,
  Plus,
  ShoppingCart,
  X,
  LogOut,
  User,
  Settings,
} from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import styles from "./AdminLayout.module.css";

const AdminLayout = () => {
  const { setAdmin, axios, admin, branding } = useContext(AppContext);
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = useMemo(
    () => {
      const items = [
        { path: "/admin", name: "Dashboard", icon: LayoutDashboard, exact: true },
        { path: "/admin/add-category", name: "Add Category", icon: Plus },
        { path: "/admin/add-menu", name: "Add Menu", icon: Package },
        { path: "/admin/categories", name: "All Categories", icon: Grid3X3 },
        { path: "/admin/menus", name: "All Menus", icon: Grid3X3 },
        { path: "/admin/orders", name: "Orders", icon: ShoppingCart },
        { path: "/admin/feedback", name: "Feedback", icon: MessageSquare },
      ];
      
      // Only show Branding Settings to super_admin
      if (admin?.adminLevel === "super_admin") {
        items.push({ path: "/admin/branding", name: "Branding Settings", icon: Settings });
      }
      
      return items;
    },
    [admin?.adminLevel]
  );

  const isActive = (path) => location.pathname === path;

  const logout = async () => {
    try {
      const { data } = await axios.post("/api/auth/logout");
      if (data.success) {
        toast.success(data.message);
        setAdmin(null);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const currentTitle =
    menuItems.find((item) => isActive(item.path))?.name || "Admin Panel";

  return (
    <div className={styles.layout}>
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.brand}>
          <div className={styles.brandLogo}>
            <Package size={20} color="white" />
          </div>
          <span>{branding?.adminPortalName || "Admin Console"}</span>
        </div>

        <nav className={styles.nav}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`${styles.navItem} ${active ? styles.active : ""}`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userCard}>
            <div className={styles.avatar}>
              <User size={18} />
            </div>
            <div className={styles.userDetails}>
              <p className={styles.userName}>Admin User</p>
              <p className={styles.userEmail}>{admin?.email || "admin@system.com"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.leftHeader}>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className={styles.mobileMenuBtn}
            >
              <Menu size={22} />
            </button>
            <h2 className={styles.pageTitle}>{currentTitle}</h2>
          </div>
          
          <button type="button" onClick={logout} className={styles.logoutBtn}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </header>

        <main className={styles.content}>
          <div className={styles.inner}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;