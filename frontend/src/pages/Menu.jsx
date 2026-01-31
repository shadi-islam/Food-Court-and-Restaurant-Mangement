import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppContext } from "../context/AppContext";
import { Search, X } from "lucide-react";
import MenuCard from "../components/MenuCard";
import styles from "./Menu.module.css";

const slugify = (s = "") =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

const Menu = () => {
  const { menus } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMenus, setFilteredMenus] = useState([]);

  // sticky active category
  const [activeCat, setActiveCat] = useState("");

  const sectionRefs = useRef({}); // { [catId]: element }

  useEffect(() => {
    const base = menus.filter((m) => m.isAvailable !== false);

    if (!searchQuery.trim()) {
      setFilteredMenus(base);
      return;
    }

    const q = searchQuery.toLowerCase();
    const filtered = base.filter((m) => m.name.toLowerCase().includes(q));
    setFilteredMenus(filtered);
  }, [searchQuery, menus]);

  // group by category
  const grouped = useMemo(() => {
    return filteredMenus.reduce((acc, item) => {
      const key = item?.category?.name || "Others";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [filteredMenus]);

  const categories = useMemo(() => Object.keys(grouped), [grouped]);

  // set default active category
  useEffect(() => {
    if (categories.length > 0) setActiveCat(categories[0]);
    else setActiveCat("");
  }, [categories]);

  // Observe which section is in view to highlight active category tab
  useEffect(() => {
    if (!categories.length) return;

    const els = categories
      .map((c) => sectionRefs.current[slugify(c)])
      .filter(Boolean);

    const io = new IntersectionObserver(
      (entries) => {
        // choose the entry most visible
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.dataset?.cat) {
          setActiveCat(visible.target.dataset.cat);
        }
      },
      {
        root: null,
        // tweak so it switches when the header reaches top-ish
        rootMargin: "-120px 0px -70% 0px",
        threshold: [0.1, 0.2, 0.4, 0.6],
      }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [categories]);

  const handleClearSearch = () => setSearchQuery("");

  const scrollToCategory = (cat) => {
    const id = slugify(cat);
    const el = sectionRefs.current[id];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Top header */}
        <div className={styles.header}>
          <div className={styles.headText}>
            <h1 className={styles.title}>
              Our <span className={styles.accent}>Menu</span>
            </h1>
            <p className={styles.subtitle}>
              Explore our delicious selection of handcrafted dishes.
            </p>
          </div>

          {/* Search */}
          <div className={styles.searchWrap}>
            <div className={styles.searchBox}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className={styles.clearBtn}
                  aria-label="Clear search"
                >
                  <X className={styles.clearIcon} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sticky category tabs (Foodpanda-like) */}
        {categories.length > 0 && (
          <div className={styles.stickyBar}>
            <div className={styles.tabs}>
              {categories.map((cat) => {
                const isActive = activeCat === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
                    onClick={() => scrollToCategory(cat)}
                  >
                    {cat}
                    <span className={styles.tabCount}>
                      {grouped[cat]?.length || 0}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className={styles.results}>
              {searchQuery ? (
                <span className={styles.resultsText}>
                  Found <span className={styles.count}>{filteredMenus.length}</span>{" "}
                  result{filteredMenus.length === 1 ? "" : "s"} for “{searchQuery}”
                </span>
              ) : (
                <span className={styles.resultsText}>
                  Showing <span className={styles.count}>{filteredMenus.length}</span>{" "}
                  dish{filteredMenus.length === 1 ? "" : "es"}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        {filteredMenus.length > 0 ? (
          <div className={styles.layout}>
            {/* Left category list (desktop) */}
            <aside className={styles.side}>
              <div className={styles.sideCard}>
                <div className={styles.sideTitle}>Categories</div>
                <div className={styles.sideList}>
                  {categories.map((cat) => {
                    const isActive = activeCat === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        className={`${styles.sideItem} ${
                          isActive ? styles.sideItemActive : ""
                        }`}
                        onClick={() => scrollToCategory(cat)}
                      >
                        <span>{cat}</span>
                        <span className={styles.sideBadge}>
                          {grouped[cat]?.length || 0}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* Right menu sections */}
            <main className={styles.main}>
              {categories.map((category) => {
                const id = slugify(category);
                return (
                  <section
                    key={category}
                    className={styles.section}
                    ref={(el) => (sectionRefs.current[id] = el)}
                    data-cat={category}
                  >
                    <div className={styles.sectionHead}>
                      <h2 className={styles.sectionTitle}>{category}</h2>
                      <div className={styles.sectionMeta}>
                        {grouped[category]?.length || 0} items
                      </div>
                    </div>

                    <div className={styles.grid}>
                      {grouped[category].map((menu) => (
                        <MenuCard menu={menu} key={menu._id} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </main>
          </div>
        ) : (
          <div className={styles.empty}>
            <p className={styles.emptyText}>No results found for “{searchQuery}”</p>
            <button onClick={handleClearSearch} className={styles.emptyBtn}>
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
