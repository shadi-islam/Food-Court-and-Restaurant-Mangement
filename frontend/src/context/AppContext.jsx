import { createContext, useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
export const AppContext = createContext();

import axios from "axios";
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
axios.defaults.withCredentials = true;
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";
import { listenToForegroundMessages, requestAndGetFcmToken } from "../firebase";
const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true); // Track initial auth loading
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menus, setMenus] = useState([]);
  const [branding, setBranding] = useState(null);
  const logoutInProgressRef = useRef(false);

  // Locked table number for QR entry
  const [tableNumber, setTableNumberState] = useState(null);

  const setTableNumber = (n) => {
    // lock once set via QR
    if (tableNumber) return;
    const parsed = Number(n);
    if (!Number.isFinite(parsed) || parsed < 1) return;
    setTableNumberState(parsed);
  };

  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const fetchCartData = async () => {
    try {
      const { data } = await axios.get("/api/cart/get");
      if (data.success) {
        setCart(data.cart);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (cart?.items) {
      const total = cart.items.reduce(
        (sum, item) => sum + item.menuItem.price * item.quantity,
        0
      );
      setTotalPrice(total);
    }
  }, [cart]);
  const cartCount = cart?.items?.reduce(
    (acc, item) => acc + item.quantity,
    0 || 0
  );
  // 🔹 Add to Cart function
  const addToCart = async (menuId) => {
    try {
      const { data } = await axios.post("/api/cart/add", {
        menuId,
        quantity: 1,
      });
      if (data.success) {
        toast.success(data.message);
        fetchCartData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Something went wrong!");
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("/api/category/all");

      if (data.success) {
        setCategories(data.categories);
      } else {
        console.log("Failed to fetch categories");
      }
    } catch (error) {
      console.log("Error fetching categories:", error);
    }
  };
  const fetchMenus = async () => {
    try {
      const { data } = await axios.get("/api/menu/all");

      if (data.success) {
        setMenus(data.menuItems);
      } else {
        console.log("Failed to fetch menus");
      }
    } catch (error) {
      console.log("Error fetching menus:", error);
    }
  };

  const isAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/is-auth");
      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const isAdminAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/admin/is-auth");
      if (data.success) {
        setAdmin(data.admin);
      }
    } catch (error) {
      // silent fail (user not admin)
    }
  };

  const fetchBranding = async () => {
    try {
      const { data } = await axios.get("/api/config/branding");
      if (data.success) {
        setBranding(data.branding);
      }
    } catch (error) {
      console.log("Error fetching branding:", error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await Promise.all([isAuth(), isAdminAuth()]);
      } finally {
        setAuthLoading(false);
      }
    };
    
    checkAuth();
    fetchCategories();
    fetchMenus();
    fetchBranding();
    fetchCartData();
  }, []);

  // Setup axios interceptor to handle 401 responses for users (not admins)
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // Only auto-logout regular users, not admins
        if (error.response?.status === 401) {
          const url = error.config?.url || "";
          // Only clear user auth for non-admin endpoints
          if (!url.includes("/admin") && user) {
            if (!logoutInProgressRef.current) {
              logoutInProgressRef.current = true;
              setUser(null);
              setTimeout(() => {
                logoutInProgressRef.current = false;
              }, 1000);
            }
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [user]);

  // FCM Push Notifications (web) - register token after user is authenticated
  useEffect(() => {
    const setup = async () => {
      if (!user) {
        console.log("[AppContext] Skipping FCM setup: no user");
        return;
      }
      try {
        console.log("[AppContext] Setting up FCM for user:", user._id, user.email);
        const token = await requestAndGetFcmToken();
        if (!token) {
          console.warn("[AppContext] FCM setup aborted: no token returned");
          return;
        }
        
        console.log("[AppContext] Registering token on backend...");
        const response = await axios.post("/api/notification/register-token", {
          token,
          platform: "web",
        });
        console.log("[AppContext] ✅ Token registered successfully:", response.data);
      } catch (err) {
        console.error("[AppContext] ❌ FCM setup failed:", err);
      }
    };
    setup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Show foreground push notifications as toast
  useEffect(() => {
    let unsub = () => {};
    (async () => {
      unsub = await listenToForegroundMessages((payload) => {
        const title = payload?.notification?.title || "Notification";
        const body = payload?.notification?.body || "";
        toast(`${title}${body ? `: ${body}` : ""}`);
      });
    })();
    return () => unsub?.();
  }, []);

  // If we have a logged-in user and a tableNumber, try to claim any guest orders
  useEffect(() => {
    const claim = async () => {
      if (!user || !tableNumber) return;
      try {
        await axios.put(`/api/order/claim/${tableNumber}`);
        // re-fetch cart/orders if needed
        fetchCartData();
      } catch (err) {
        // silent
      }
    };
    claim();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, tableNumber]);

  const socket = useMemo(() => {
    // connect once; cookie auth is used by the backend
    const url = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_BASE_URL || "http://localhost:5000";
    const s = io(url, { withCredentials: true, transports: ["websocket"] });
    return s;
  }, []);

  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, [socket]);
  const value = {
    navigate,
    loading,
    setLoading,
    authLoading,
    user,
    setUser,
    axios,
    admin,
    setAdmin,
    categories,
    fetchCategories,
    menus,
    fetchMenus,
    branding,
    fetchBranding,
    setBranding,
    addToCart,
    cartCount,
    cart,
    totalPrice,
    fetchCartData,
    tableNumber,
    setTableNumber,
    socket,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
