import { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { Upload, PlusCircle, Image as ImageIcon, IndianRupee } from "lucide-react";
import { toast } from "react-hot-toast";
import styles from "./AddMenu.module.css";

const AddMenu = () => {
  const { axios, navigate, loading, setLoading } = useContext(AppContext);
  const [categories, setCategories] = useState([]);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    image: null,
    description: "",
  });

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("/api/category/all");
      if (data.success) setCategories(data.categories);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const categoryOptions = useMemo(() => categories || [], [categories]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData((p) => ({ ...p, image: file }));
    setPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("price", formData.price);
      fd.append("category", formData.category);
      fd.append("description", formData.description);
      fd.append("image", formData.image);

      const { data } = await axios.post("/api/menu/add", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data.success) {
        toast.success(data.message);
        navigate("/admin/menus");
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Add New Menu Item</h1>
        <p className={styles.subtitle}>Create a delicious addition to your digital menu</p>
      </header>

      <form className={styles.card} onSubmit={onSubmit}>
        <div className={styles.grid}>
          {/* Left Column: Text Data */}
          <div className={styles.formColumn}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Item Name *</label>
              <input
                className={styles.input}
                name="name"
                value={formData.name}
                onChange={onChange}
                required
                placeholder="e.g. Grilled Chicken Pasta"
              />
            </div>

            <div className={styles.row}>
              <div className={styles.inputGroup} style={{ flex: 1 }}>
                <label className={styles.label}>Price (৳) *</label>
                <input
                  className={styles.input}
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={onChange}
                  required
                  placeholder="0.00"
                  min="0"
                />
              </div>
              <div className={styles.inputGroup} style={{ flex: 1 }}>
                <label className={styles.label}>Category *</label>
                <select
                  className={styles.input}
                  name="category"
                  value={formData.category}
                  onChange={onChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categoryOptions.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Description *</label>
              <textarea
                className={styles.textarea}
                name="description"
                value={formData.description}
                onChange={onChange}
                rows={3}
                placeholder="Describe the ingredients or taste profile..."
                required
              />
            </div>
          </div>

          {/* Right Column: Image Upload */}
          <div className={styles.uploadColumn}>
            <label className={styles.label}>Item Image *</label>
            <div className={styles.uploadWrapper}>
              <input 
                className={styles.hiddenInput} 
                type="file" 
                id="menuImage"
                onChange={onFile} 
                required={!preview}
                accept="image/*"
              />
              <label htmlFor="menuImage" className={`${styles.dropzone} ${preview ? styles.hasPreview : ""}`}>
                {preview ? (
                  <div className={styles.previewContainer}>
                    <img className={styles.previewImage} src={preview} alt="preview" />
                    <div className={styles.overlay}>
                      <ImageIcon size={20} />
                      <span>Change Image</span>
                    </div>
                  </div>
                ) : (
                  <div className={styles.placeholder}>
                    <div className={styles.iconCircle}>
                      <Upload size={20} />
                    </div>
                    <p className={styles.uploadText}>Click to upload image</p>
                    <p className={styles.uploadSubtext}>JPG, PNG up to 5MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.primaryBtn} disabled={loading} type="submit">
            {loading ? (
              <span className={styles.loader}></span>
            ) : (
              <>
                <PlusCircle size={18} />
                <span>Add Item to Menu</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMenu;