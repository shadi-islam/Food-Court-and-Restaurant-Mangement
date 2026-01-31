import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { LockIcon, MailIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import { AppContext } from "../context/AppContext";
import styles from "./Login.module.css";

const Login = () => {
  const { navigate, loading, setLoading, axios, setUser } =
    useContext(AppContext);

  const [formData, setFormData] = useState({ email: "", password: "" });

  const onChangeHandler = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await axios.post("/api/auth/login", formData);
      if (data.success) {
        setUser(data.user);
        toast.success(data.message);
        navigate("/");
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post("/api/auth/guest");
      if (data.success) {
        setUser(data.user);
        toast.success(data.message);
        navigate("/menu");
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.bgGlow} aria-hidden="true" />

      <form onSubmit={handleSubmit} className={styles.card}>
        <div className={styles.head}>
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>Login to continue your order</p>
        </div>

        <div className={styles.field}>
          <span className={styles.iconWrap} aria-hidden="true">
            <MailIcon size={18} />
          </span>
          <input
            type="email"
            placeholder="Email address"
            className={styles.input}
            name="email"
            value={formData.email}
            onChange={onChangeHandler}
            autoComplete="email"
            required
          />
        </div>

        <div className={styles.field}>
          <span className={styles.iconWrap} aria-hidden="true">
            <LockIcon size={18} />
          </span>
          <input
            type="password"
            placeholder="Password"
            className={styles.input}
            name="password"
            value={formData.password}
            onChange={onChangeHandler}
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" className={styles.primaryBtn} disabled={loading}>
          {loading ? "Loading..." : "Login"}
        </button>

        <button
          type="button"
          onClick={handleGuestLogin}
          className={styles.secondaryBtn}
          disabled={loading}
        >
          Continue as Guest
        </button>

        <p className={styles.footerText}>
          Don&apos;t have an account?{" "}
          <Link to="/signup" className={styles.link}>
            Signup
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
