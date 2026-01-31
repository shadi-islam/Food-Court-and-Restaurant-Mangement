import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";
import { Edit2, Trash2, Eye, EyeOff, Search, Utensils, DollarSign } from "lucide-react";
import styles from "./Menus.module.css";

const Menus = () => {
  const { axios } = useContext(AppContext);
  const [menus, setMenus] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchMenus = async () => {
    try {
      const { data } = await axios.get("/api/menu/all");
      if (data.success) setMenus(data.menuItems);
      else toast.error(data.message);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const toggleAvailability = async (id, isAvailable) => {
    try {
      const fd = new FormData();
      fd.append("isAvailable", String(isAvailable));
      const { data } = await axios.put(`/api/menu/update/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data.success) {
        toast.success(data.message);
        fetchMenus();
      } else toast.error(data.message);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteMenu = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this menu item?");
    if (!ok) return;
    try {
      const { data } = await axios.delete(`/api/menu/delete/${id}`);
      if (data.success) {
        toast.success(data.message || "Deleted");
        fetchMenus();
      } else toast.error(data.message);
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  const quickEdit = async (m) => {
    try {
      const name = window.prompt("Name", m.name) ?? m.name;
      const price = window.prompt("Price", String(m.price)) ?? String(m.price);
      const description = window.prompt("Description", m.description || "") ?? (m.description || "");
      
      if (!name || !price) return;

      const fd = new FormData();
      fd.append("name", name);
      fd.append("price", price);
      fd.append("description", description);
      const { data } = await axios.put(`/api/menu/update/${m._id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data.success) {
        toast.success(data.message);
        fetchMenus();
      } else toast.error(data.message);
    } catch (e) {
      toast.error("Failed to update");
    }
  };

  const filteredMenus = menus.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <Utensils className={styles.titleIcon} size={24} />
          <h1 className={styles.title}>Menu Inventory</h1>
        </div>

        <div className={styles.searchBar}>
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search dish or category..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '35%' }}>Item Details</th>
                <th style={{ width: '15%' }}>Category</th>
                <th style={{ width: '15%' }}>Price</th>
                <th className={styles.centerAlign} style={{ width: '15%' }}>Status</th>
                <th className={styles.centerAlign} style={{ width: '20%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMenus.map((m) => (
                <tr key={m._id} className={styles.row}>
                  <td>
                    <div className={styles.itemCell}>
                      <img className={styles.thumb} src={m.image} alt={m.name} />
                      <div className={styles.itemInfo}>
                        <div className={styles.itemName}>{m.name}</div>
                        <div className={styles.itemDesc}>
                          {m.description?.slice(0, 45)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={styles.categoryBadge}>
                      {m.category?.name || "Uncategorized"}
                    </span>
                  </td>
                  <td className={styles.priceCell}>
                    <span className={styles.taka}>৳</span>
                    {m.price}
                  </td>
                  <td className={styles.centerAlign}>
                    <button
                      className={`${styles.statusBadge} ${m.isAvailable ? styles.active : styles.hidden}`}
                      onClick={() => toggleAvailability(m._id, !m.isAvailable)}
                    >
                      {m.isAvailable ? <Eye size={14} /> : <EyeOff size={14} />}
                      <span>{m.isAvailable ? "Available" : "Hidden"}</span>
                    </button>
                  </td>
                  <td className={styles.centerAlign}>
                    <div className={styles.actionGroup}>
                      <button className={styles.editBtn} onClick={() => quickEdit(m)}>
                        <Edit2 size={16} />
                      </button>
                      <button className={styles.deleteBtn} onClick={() => deleteMenu(m._id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Menus;