import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { Edit2, Trash2, Layers, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import styles from "./Categories.module.css";

const Categories = () => {
  const { axios } = useContext(AppContext);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("/api/category/all");
      if (data.success) setCategories(data.categories);
      else toast.error(data.message);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const deleteCategory = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this category?");
    if (!ok) return;
    try {
      const { data } = await axios.delete(`/api/category/delete/${id}`);
      if (data.success) {
        toast.success(data.message || "Deleted successfully");
        fetchCategories();
      } else toast.error(data.message);
    } catch (e) {
      toast.error("Failed to delete category");
    }
  };

  const renameCategory = async (c) => {
    const name = window.prompt("Enter new category name:", c.name);
    if (!name || name === c.name) return;
    try {
      const fd = new FormData();
      fd.append("name", name);
      const { data } = await axios.put(`/api/category/update/${c._id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data.success) {
        toast.success(data.message);
        fetchCategories();
      } else toast.error(data.message);
    } catch (e) {
      toast.error("Failed to update category");
    }
  };

  // Filter logic (optional, but makes it look lucrative)
  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <Layers className={styles.titleIcon} size={24} />
          <h1 className={styles.title}>Category Management</h1>
        </div>
        
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <input 
            type="text" 
            placeholder="Search categories..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className={styles.card}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Preview</th>
                <th>Category Name</th>
                <th className={styles.centerAlign}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((c) => (
                  <tr key={c._id} className={styles.row}>
                    <td>
                      <div className={styles.imageContainer}>
                        <img src={c.image} alt={c.name} className={styles.categoryImg} />
                      </div>
                    </td>
                    <td className={styles.categoryName}>{c.name}</td>
                    <td>
                      <div className={styles.actionGroup}>
                        <button 
                          className={`${styles.actionBtn} ${styles.editBtn}`} 
                          onClick={() => renameCategory(c)}
                          title="Rename"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          className={`${styles.actionBtn} ${styles.deleteBtn}`} 
                          onClick={() => deleteCategory(c._id)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className={styles.emptyState}>
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Categories;