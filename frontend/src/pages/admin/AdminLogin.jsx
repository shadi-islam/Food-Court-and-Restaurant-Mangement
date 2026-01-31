import { useContext, useState } from "react";
import { toast } from "react-hot-toast";
import { AppContext } from "../../context/AppContext";
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from "lucide-react";
import styles from "./AdminLogin.module.css";

const AdminLogin = () => {
  const { axios, setAdmin, navigate, loading, setLoading, branding } = useContext(AppContext);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const onChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await axios.post("/api/auth/admin/login", formData);
      if (data.success) {
        setAdmin(data.admin);
        toast.success(data.message);
        navigate("/admin");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.loginContainer}>
        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <div className={styles.header}>
            <div className={styles.iconBox}>
              <ShieldCheck size={32} />
            </div>
            <h1 className={styles.title}>{branding?.adminPortalName || "Admin Login"}</h1>
            <p className={styles.subtitle}>Secure Access Portal</p>
          </div>

          <div className={styles.inputField}>
            <Mail className={styles.icon} size={18} />
            <input
              type="email"
              name="email"
              placeholder="Username / Email"
              value={formData.email}
              onChange={onChange}
              required
            />
          </div>

          <div className={styles.inputField}>
            <Lock className={styles.icon} size={18} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={onChange}
              required
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? <div className={styles.loader}></div> : "Login"}
          </button>
        </form>
        <p className={styles.copyright}>© 2026 {branding?.siteName || "Restaurant"} Admin</p>
      </div>
    </div>
  );
};

export default AdminLogin;