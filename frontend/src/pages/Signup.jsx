import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { LockIcon, MailIcon, User2Icon } from "lucide-react";
import { toast } from "react-hot-toast";
import { AppContext } from "../context/AppContext";
import styles from "./Signup.module.css";

const Signup = () => {
  const { navigate, axios, loading, setLoading } = useContext(AppContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const onChangeHandler = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await axios.post("/api/auth/register", formData);
      if (data.success) {
        toast.success(data.message);
        navigate("/login");
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
      <div className={styles.bgGlow} aria-hidden="true" />

      <form onSubmit={handleSubmit} className={styles.card}>
        <div className={styles.head}>
          <h1 className={styles.title}>Create account</h1>
          <p className={styles.subtitle}>Sign up to start ordering</p>
        </div>

        <div className={styles.field}>
          <span className={styles.iconWrap} aria-hidden="true">
            <User2Icon size={18} />
          </span>
          <input
            type="text"
            placeholder="Full name"
            className={styles.input}
            name="name"
            value={formData.name}
            onChange={onChangeHandler}
            autoComplete="name"
            required
          />
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
            autoComplete="new-password"
            required
          />
        </div>

        <button type="submit" className={styles.primaryBtn} disabled={loading}>
          {loading ? "Loading..." : "Create account"}
        </button>

        <p className={styles.footerText}>
          Already have an account?{" "}
          <Link to="/login" className={styles.link}>
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
