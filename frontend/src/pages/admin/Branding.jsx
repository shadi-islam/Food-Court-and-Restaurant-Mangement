import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { Save, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import styles from "./Branding.module.css";

const Branding = () => {
  const { axios, branding, fetchBranding, loading, setLoading } = useContext(AppContext);
  const [formData, setFormData] = useState({
    siteName: "",
    ownerName: "",
    adminPortalName: "",
    footerText: "",
    logoUrl: "",
  });

  // Load branding on component mount
  useEffect(() => {
    if (!branding) {
      fetchBranding();
    } else {
      setFormData({
        siteName: branding.siteName || "",
        ownerName: branding.ownerName || "",
        adminPortalName: branding.adminPortalName || "",
        footerText: branding.footerText || "",
        logoUrl: branding.logoUrl || "",
      });
    }
  }, [branding, fetchBranding]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log("[BRANDING UPDATE] Sending branding data:", {
        siteName: formData.siteName,
        ownerName: formData.ownerName,
        logoUrl: formData.logoUrl,
        adminPortalName: formData.adminPortalName,
        footerText: formData.footerText,
      });
      
      const { data } = await axios.put("/api/config/branding", formData);
      if (data.success) {
        console.log("[BRANDING UPDATE] ✅ Update successful:", {
          logoUrl: data.branding?.logoUrl,
        });
        toast.success(data.message || "Branding updated successfully!");
        await fetchBranding();
      } else {
        console.log("[BRANDING UPDATE] ❌ Update failed:", data.message);
        toast.error(data.message || "Failed to update branding");
      }
    } catch (error) {
      console.error("[BRANDING UPDATE] Error:", error);
      console.error("Full error object:", error);
      console.error("Error response:", error.response);
      console.error("Error message:", error.message);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Branding Settings</h1>
          <p className={styles.subtitle}>Manage your site branding and identity</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className={styles.card}>
        <div className={styles.grid}>
          {/* Left Column */}
          <div className={styles.column}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Site Name</label>
              <input
                type="text"
                name="siteName"
                value={formData.siteName}
                onChange={handleChange}
                placeholder="e.g. My Restaurant"
                className={styles.input}
              />
              <p className={styles.hint}>
                This is displayed in the header, footer, and login pages
              </p>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Owner Name</label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                className={styles.input}
              />
              <p className={styles.hint}>
                The name of the restaurant owner or organization
              </p>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Admin Portal Name</label>
              <input
                type="text"
                name="adminPortalName"
                value={formData.adminPortalName}
                onChange={handleChange}
                placeholder="e.g. Admin Console"
                className={styles.input}
              />
              <p className={styles.hint}>
                The title displayed in the admin sidebar and login page
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className={styles.column}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Footer Text</label>
              <textarea
                name="footerText"
                value={formData.footerText}
                onChange={handleChange}
                placeholder="e.g. © 2026 All rights reserved."
                className={styles.textarea}
                rows={4}
              />
              <p className={styles.hint}>
                The copyright or footer message displayed at the bottom of pages
              </p>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Logo URL</label>
              <input
                type="url"
                name="logoUrl"
                value={formData.logoUrl}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
                className={styles.input}
              />
              <p className={styles.hint}>
                Full URL to your logo image (optional)
              </p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className={styles.infoBox}>
          <AlertCircle size={18} />
          <p>
            Changes will be applied across the entire website immediately. All
            users will see the updated branding.
          </p>
        </div>

        {/* Submit Button */}
        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className={styles.loader}></span>
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Branding;
