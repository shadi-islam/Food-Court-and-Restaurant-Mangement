import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import MenuDetails from "./pages/MenuDetails";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import TableEntry from "./pages/TableEntry";
import PaymentDemo from "./pages/PaymentDemo";
import MyOrders from "./pages/MyOrders";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";
import AdminLayout from "./pages/admin/AdminLayout";
import { useContext } from "react";
import { AppContext } from "./context/AppContext";
import AdminLogin from "./pages/admin/AdminLogin";
import AddCategory from "./pages/admin/AddCategory";
import AddMenu from "./pages/admin/AddMenu";
import Categories from "./pages/admin/Categories";
import Menus from "./pages/admin/Menus";
import Orders from "./pages/admin/Orders";
import Dashboard from "./pages/admin/Dashboard";
import Feedback from "./pages/admin/Feedback";
import Branding from "./pages/admin/Branding";
const App = () => {
  const adminPath = useLocation().pathname.includes("admin");
  const { admin, authLoading } = useContext(AppContext);

  // Show loading screen while checking auth on page load
  if (authLoading && adminPath) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "24px", marginBottom: "20px" }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Toaster />
      {!adminPath && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/menu-details/:id" element={<MenuDetails />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment-demo" element={<PaymentDemo />} />
        {/* QR entry: /table/5 or /table?table=5 */}
        <Route path="/table" element={<TableEntry />} />
        <Route path="/table/:tableNumber" element={<TableEntry />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />

        {/* admin routes  */}
        <Route path="/admin" element={admin ? <AdminLayout /> : <AdminLogin />}>
          <Route index element={admin ? <Dashboard /> : <AdminLogin />} />
          <Route
            path="add-category"
            element={admin ? <AddCategory /> : <AdminLogin />}
          />
          <Route
            path="add-menu"
            element={admin ? <AddMenu /> : <AdminLogin />}
          />
          <Route
            path="categories"
            element={admin ? <Categories /> : <AdminLogin />}
          />
          <Route path="menus" element={admin ? <Menus /> : <AdminLogin />} />
          <Route path="orders" element={admin ? <Orders /> : <AdminLogin />} />
          <Route
            path="feedback"
            element={admin ? <Feedback /> : <AdminLogin />}
          />
          <Route
            path="branding"
            element={admin?.adminLevel === "super_admin" ? <Branding /> : <AdminLogin />}
          />
          {/* bookings removed (QR table flow) */}
        </Route>
      </Routes>
      {!adminPath && <Footer />}
    </div>
  );
};
export default App;
