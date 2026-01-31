import { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { Upload, PlusCircle, Image as ImageIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import styles from "./AddCategory.module.css";

const AddCategory = () => {
  const { axios, navigate, loading, setLoading } = useContext(AppContext);
  const [formData, setFormData] = useState({ name: "", image: null });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setFormData({ ...formData, image: selectedFile });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("image", formData.image);
      const { data } = await axios.post("/api/category/add", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data.success) {
        toast.success(data.message);
        navigate("/admin/categories");
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
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Create New Category</h1>
          <p className={styles.subtitle}>Fill in the details to expand your marketplace</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className={styles.card}>
        <div className={styles.grid}>
          {/* Left Column: Name & Submit */}
          <div className={styles.column}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Category Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="e.g. Electronics"
              />
            </div>
            
            <button 
              className={styles.submitBtn} 
              type="submit" 
              disabled={loading}
            >
              {loading ? (
                <span className={styles.loader}></span>
              ) : (
                <>
                  <PlusCircle size={18} />
                  <span>Add Category</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Image Upload */}
          <div className={styles.column}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Category Image</label>
              <div className={styles.uploadWrapper}>
                <input
                  type="file"
                  id="fileUpload"
                  className={styles.hiddenInput}
                  onChange={handleFileChange}
                  accept="image/*"
                  required={!preview}
                />
                
                <label htmlFor="fileUpload" className={`${styles.dropzone} ${preview ? styles.hasPreview : ""}`}>
                  {preview ? (
                    <div className={styles.previewContainer}>
                      <img src={preview} alt="preview" className={styles.imagePreview} />
                      <div className={styles.overlay}>
                        <ImageIcon size={20} />
                        <span>Change Image</span>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.uploadPlaceholder}>
                      <div className={styles.iconCircle}>
                        <Upload size={18} />
                      </div>
                      <div className={styles.textStack}>
                        <p className={styles.uploadText}><strong>Upload Image</strong></p>
                        <p className={styles.uploadSubtext}>Click or drag & drop</p>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddCategory;