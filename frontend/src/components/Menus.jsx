import { useContext, useMemo, useState } from "react";
import { AppContext } from "../context/AppContext";
import MenuCard from "./MenuCard";
import styles from "./Menus.module.css";

const Menus = () => {
  const { menus } = useContext(AppContext);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured"); // featured | priceLow | priceHigh | name

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = (menus || []).filter((m) => {
      if (!q) return true;
      return (
        String(m?.name ?? "").toLowerCase().includes(q) ||
        String(m?.description ?? "").toLowerCase().includes(q)
      );
    });

    const toNum = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    if (sort === "priceLow") list.sort((a, b) => toNum(a.price) - toNum(b.price));
    if (sort === "priceHigh") list.sort((a, b) => toNum(b.price) - toNum(a.price));
    if (sort === "name")
      list.sort((a, b) => String(a?.name ?? "").localeCompare(String(b?.name ?? "")));

    // featured keeps original order
    return list;
  }, [menus, query, sort]);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>
              Our <span className={styles.accent}>Menu</span>
            </h1>
            <p className={styles.subtitle}>
              Explore handcrafted dishes made with fresh ingredients — fast to order,
              easy to love.
            </p>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <input
                className={styles.search}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search dishes…"
                aria-label="Search menu items"
              />
              {query ? (
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              ) : null}
            </div>

            <div className={styles.controls}>
              <div className={styles.count} aria-label="Menu count">
                {filtered.length} items
              </div>

              <select
                className={styles.select}
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Sort menu items"
              >
                <option value="featured">Featured</option>
                <option value="priceLow">Price: Low → High</option>
                <option value="priceHigh">Price: High → Low</option>
                <option value="name">Name: A → Z</option>
              </select>
            </div>
          </div>
        </header>

        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <h3 className={styles.emptyTitle}>No matches found</h3>
            <p className={styles.emptyText}>
              Try a different keyword (e.g., “burger”, “pizza”, “chicken”).
            </p>
            <button type="button" className={styles.resetBtn} onClick={() => setQuery("")}>
              Reset search
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map((menu) => (
              <MenuCard key={menu._id} menu={menu} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Menus;
