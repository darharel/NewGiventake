import { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate, NavLink, useNavigate } from "react-router-dom";
import { api } from "./api";

const categories = [
  "אלקטרוניקה",
  "גיימינג",
  "ריהוט",
  "ספרים",
  "כלי עבודה",
  "ספורט",
  "אופנה",
  "אספנות",
  "תאורה",
  "אחר",
];

const conditions = ["חדש", "כמו חדש", "טוב", "סביר", "דורש תיקון"];

const navItems = [
  { to: "/discover", label: "גילוי" },
  { to: "/items", label: "המוצרים שלי" },
  { to: "/add", label: "הוספה" },
  { to: "/inbox", label: "Inbox" },
  { to: "/profile", label: "פרופיל" },
];

function chipString(value) {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function AppShell({ user, onLogout, children, notificationsCount }) {
  return (
    <div className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">GivenTake</p>
          <h1>תן משהו שאתה לא צריך, קבל משהו שאתה רוצה</h1>
        </div>
        <button className="ghost-button" onClick={onLogout}>
          יציאה
        </button>
      </header>
      <main className="content">{children}</main>
      <nav className="bottom-nav">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className="nav-link">
            {item.label}
            {item.to === "/inbox" && notificationsCount > 0 ? (
              <span className="badge">{notificationsCount}</span>
            ) : null}
          </NavLink>
        ))}
        {user?.is_admin ? (
          <NavLink to="/admin" className="nav-link">
            Admin
          </NavLink>
        ) : null}
      </nav>
    </div>
  );
}

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    email: "demo@giventake.app",
    password: "123456",
    displayName: "",
    city: "",
    interests: "ספרים, תאורה",
    wishlist: "מנורה, כיסא קטן",
    avatarUrl: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload =
        mode === "login"
          ? { email: form.email, password: form.password }
          : {
              email: form.email,
              password: form.password,
              displayName: form.displayName,
              city: form.city,
              interests: chipString(form.interests),
              wishlist: chipString(form.wishlist),
              avatarUrl: form.avatarUrl,
            };

      const data =
        mode === "login" ? await api.login(payload) : await api.register(payload);
      onAuth(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-layout">
      <section className="hero-card">
        <p className="eyebrow">ברוכים הבאים ל-GivenTake</p>
        <h1>החלפת חפצים חכמה, פשוטה ובלי כסף</h1>
        <p>
          העלו מוצר, מצאו התאמות לפי תחומי עניין ושלחו הצעת טרייד מתוך מסך אחד
          ברור ונעים במובייל.
        </p>
        <div className="hero-points">
          <span>פיד מוצרים</span>
          <span>Wishlist</span>
          <span>צ׳אט טרייד</span>
        </div>
      </section>
      <section className="card form-card">
        <div className="section-header">
          <h2>{mode === "login" ? "התחברות" : "יצירת חשבון"}</h2>
          <button
            className="link-button"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "אין לך חשבון?" : "כבר נרשמת?"}
          </button>
        </div>
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            אימייל
            <input
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="name@example.com"
            />
          </label>
          <label>
            סיסמה
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="לפחות 6 תווים"
            />
          </label>
          {mode === "register" ? (
            <>
              <label>
                שם תצוגה
                <input
                  value={form.displayName}
                  onChange={(event) =>
                    setForm({ ...form, displayName: event.target.value })
                  }
                />
              </label>
              <label>
                עיר / אזור
                <input
                  value={form.city}
                  onChange={(event) => setForm({ ...form, city: event.target.value })}
                />
              </label>
              <label>
                תמונת פרופיל
                <input
                  value={form.avatarUrl}
                  onChange={(event) =>
                    setForm({ ...form, avatarUrl: event.target.value })
                  }
                  placeholder="https://..."
                />
              </label>
              <label>
                תחומי עניין
                <input
                  value={form.interests}
                  onChange={(event) =>
                    setForm({ ...form, interests: event.target.value })
                  }
                  placeholder="הפרדה בפסיקים"
                />
              </label>
              <label>
                Wishlist
                <input
                  value={form.wishlist}
                  onChange={(event) =>
                    setForm({ ...form, wishlist: event.target.value })
                  }
                  placeholder="מה תרצה לקבל?"
                />
              </label>
            </>
          ) : null}
          {error ? <p className="error-box">{error}</p> : null}
          <button className="primary-button" disabled={loading}>
            {loading ? "טוען..." : mode === "login" ? "כניסה" : "התחל עכשיו"}
          </button>
        </form>
        <p className="helper-text">
          חשבון דמו זמין כברירת מחדל: <strong>demo@giventake.app / 123456</strong>
        </p>
      </section>
    </div>
  );
}

function DiscoverPage({ items, filters, setFilters, onToggleFavorite, onOpenTrade }) {
  const filteredQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.category) params.set("category", filters.category);
    if (filters.city) params.set("city", filters.city);
    if (filters.condition) params.set("condition", filters.condition);
    return `?${params.toString()}`;
  }, [filters]);

  return (
    <div className="stack">
      <section className="card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Discover</p>
            <h2>מוצרים שיכולים להתאים לך</h2>
          </div>
          <p className="helper-text">שאילתה פעילה: {filteredQuery}</p>
        </div>
        <div className="filters">
          <input
            placeholder="חיפוש חופשי"
            value={filters.search}
            onChange={(event) =>
              setFilters({ ...filters, search: event.target.value })
            }
          />
          <select
            value={filters.category}
            onChange={(event) =>
              setFilters({ ...filters, category: event.target.value })
            }
          >
            <option value="">כל הקטגוריות</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <input
            placeholder="אזור"
            value={filters.city}
            onChange={(event) => setFilters({ ...filters, city: event.target.value })}
          />
          <select
            value={filters.condition}
            onChange={(event) =>
              setFilters({ ...filters, condition: event.target.value })
            }
          >
            <option value="">כל המצבים</option>
            {conditions.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>
        </div>
      </section>
      <section className="item-grid">
        {items.map((item) => (
          <article key={item.id} className="card item-card">
            <img
              src={item.primary_image || "https://placehold.co/600x400?text=GivenTake"}
              alt={item.title}
            />
            <div className="item-card-body">
              <div className="section-header tight">
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.category}</p>
                </div>
                {item.match_score > 0 ? <span className="pill">התאמה טובה</span> : null}
              </div>
              <p>{item.description}</p>
              <div className="meta-row">
                <span>{item.condition}</span>
                <span>{item.city}</span>
                <span>{item.owner_name}</span>
              </div>
              <div className="tag-row">
                {(item.desired_categories || []).map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="actions-row">
                <button className="primary-button" onClick={() => onOpenTrade(item)}>
                  הצע טרייד
                </button>
                <button
                  className="ghost-button"
                  onClick={() => onToggleFavorite(item.id)}
                >
                  {item.is_favorite ? "הוסר ממועדפים" : "שמור למועדפים"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function AddItemPage({ onSubmit }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: categories[0],
    condition: conditions[2],
    city: "",
    desiredText: "",
    desiredCategories: [],
    images: [],
  });
  const [status, setStatus] = useState("");

  function handleFile(event) {
    const files = Array.from(event.target.files || []);
    Promise.all(
      files.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
          }),
      ),
    ).then((results) => setForm({ ...form, images: results }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit({
      ...form,
      desiredCategories: form.desiredCategories.filter(Boolean),
    });
    setStatus("המוצר פורסם בהצלחה");
    setForm({
      title: "",
      description: "",
      category: categories[0],
      condition: conditions[2],
      city: "",
      desiredText: "",
      desiredCategories: [],
      images: [],
    });
  }

  return (
    <section className="card">
      <div className="section-header">
        <div>
          <p className="eyebrow">Add Item</p>
          <h2>העלה מוצר חדש בארבעה צעדים קצרים</h2>
        </div>
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          תמונות
          <input type="file" accept="image/*" multiple onChange={handleFile} />
        </label>
        <div className="preview-row">
          {form.images.map((image, index) => (
            <img key={index} src={image} alt={`preview-${index}`} className="preview-image" />
          ))}
        </div>
        <label>
          שם מוצר
          <input
            required
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
          />
        </label>
        <label>
          תיאור קצר
          <textarea
            required
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
          />
        </label>
        <label>
          קטגוריה
          <select
            value={form.category}
            onChange={(event) => setForm({ ...form, category: event.target.value })}
          >
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>
        <label>
          מצב מוצר
          <select
            value={form.condition}
            onChange={(event) => setForm({ ...form, condition: event.target.value })}
          >
            {conditions.map((condition) => (
              <option key={condition}>{condition}</option>
            ))}
          </select>
        </label>
        <label>
          אזור החלפה
          <input
            required
            value={form.city}
            onChange={(event) => setForm({ ...form, city: event.target.value })}
          />
        </label>
        <label>
          מה היית רוצה לקבל
          <input
            value={form.desiredText}
            onChange={(event) =>
              setForm({ ...form, desiredText: event.target.value })
            }
            placeholder="מקלדת, מנורה, גאדג׳טים..."
          />
        </label>
        <label>
          קטגוריות רצויות
          <input
            value={form.desiredCategories.join(", ")}
            onChange={(event) =>
              setForm({
                ...form,
                desiredCategories: chipString(event.target.value),
              })
            }
            placeholder="הפרדה בפסיקים"
          />
        </label>
        {status ? <p className="success-box">{status}</p> : null}
        <button className="primary-button">פרסם מוצר</button>
      </form>
    </section>
  );
}

function MyItemsPage({ items, onStatusChange }) {
  const groups = {
    active: "פעילים",
    paused: "מושהים",
    pending_trade: "בתהליך טרייד",
    traded: "הוחלפו",
  };

  return (
    <div className="stack">
      {Object.entries(groups).map(([status, label]) => (
        <section key={status} className="card">
          <div className="section-header">
            <h2>{label}</h2>
          </div>
          <div className="compact-list">
            {items
              .filter((item) => item.status === status)
              .map((item) => (
                <div key={item.id} className="list-row">
                  <div>
                    <strong>{item.title}</strong>
                    <p>
                      {item.category} · {item.city}
                    </p>
                  </div>
                  <div className="actions-row">
                    {status === "active" ? (
                      <button
                        className="ghost-button"
                        onClick={() => onStatusChange(item.id, "paused")}
                      >
                        השהה
                      </button>
                    ) : null}
                    {status === "paused" ? (
                      <button
                        className="ghost-button"
                        onClick={() => onStatusChange(item.id, "active")}
                      >
                        החזר לפעילות
                      </button>
                    ) : null}
                    {status !== "traded" ? (
                      <button
                        className="primary-button"
                        onClick={() => onStatusChange(item.id, "traded")}
                      >
                        סמן כמוחלף
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function InboxPage({ inbox, onTradeAction, onSendMessage }) {
  const [activeTradeId, setActiveTradeId] = useState(null);
  const [message, setMessage] = useState("");
  const currentTrade =
    inbox.received.find((trade) => trade.id === activeTradeId) ||
    inbox.sent.find((trade) => trade.id === activeTradeId) ||
    null;

  return (
    <div className="stack inbox-grid">
      <section className="card">
        <div className="section-header">
          <h2>הצעות שהתקבלו</h2>
        </div>
        <div className="compact-list">
          {inbox.received.map((trade) => (
            <div key={trade.id} className="list-row">
              <div>
                <strong>{trade.requested_item_title}</strong>
                <p>
                  {trade.sender_name} רוצה להציע {trade.offered_titles.join(" + ")}
                </p>
                <small>{trade.status_label}</small>
              </div>
              <div className="actions-row">
                <button className="ghost-button" onClick={() => setActiveTradeId(trade.id)}>
                  פתח שיחה
                </button>
                <button
                  className="primary-button"
                  onClick={() => onTradeAction(trade.id, "accepted")}
                >
                  אשר
                </button>
                <button
                  className="ghost-button"
                  onClick={() => onTradeAction(trade.id, "rejected")}
                >
                  דחה
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="card">
        <div className="section-header">
          <h2>הצעות שנשלחו</h2>
        </div>
        <div className="compact-list">
          {inbox.sent.map((trade) => (
            <div key={trade.id} className="list-row">
              <div>
                <strong>{trade.requested_item_title}</strong>
                <p>
                  ל-{trade.receiver_name} הצעת {trade.offered_titles.join(" + ")}
                </p>
                <small>{trade.status_label}</small>
              </div>
              <div className="actions-row">
                <button className="ghost-button" onClick={() => setActiveTradeId(trade.id)}>
                  שיחה
                </button>
                {trade.status === "pending" ? (
                  <button
                    className="ghost-button"
                    onClick={() => onTradeAction(trade.id, "cancelled")}
                  >
                    בטל
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="card">
        <div className="section-header">
          <h2>צ׳אט טרייד</h2>
        </div>
        {currentTrade ? (
          <>
            <p className="trade-banner">
              מבוקש: {currentTrade.requested_item_title} · מוצע:{" "}
              {currentTrade.offered_titles.join(" + ")}
            </p>
            <div className="chat-box">
              {currentTrade.messages.map((entry) => (
                <div key={entry.id} className="chat-message">
                  <strong>{entry.sender_name}</strong>
                  <p>{entry.content}</p>
                </div>
              ))}
            </div>
            <form
              className="chat-form"
              onSubmit={async (event) => {
                event.preventDefault();
                await onSendMessage(currentTrade.id, message);
                setMessage("");
              }}
            >
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="כתבו הודעה..."
              />
              <button className="primary-button">שלח</button>
            </form>
          </>
        ) : (
          <p className="helper-text">בחרו טרייד כדי לפתוח שיחה</p>
        )}
      </section>
    </div>
  );
}

function ProfilePage({ user, onUpdate, favorites }) {
  const [form, setForm] = useState({
    displayName: user.display_name,
    city: user.city,
    avatarUrl: user.avatar_url || "",
    interests: (user.interests || []).join(", "),
    wishlist: (user.wishlist || []).join(", "),
  });

  return (
    <div className="stack">
      <section className="card profile-card">
        <img
          className="avatar"
          src={user.avatar_url || "https://placehold.co/160x160?text=GT"}
          alt={user.display_name}
        />
        <div>
          <h2>{user.display_name}</h2>
          <p>{user.city}</p>
          <div className="tag-row">
            {(user.interests || []).map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>
      <section className="card">
        <div className="section-header">
          <h2>עריכת פרופיל</h2>
        </div>
        <form
          className="form-grid"
          onSubmit={(event) => {
            event.preventDefault();
            onUpdate({
              displayName: form.displayName,
              city: form.city,
              avatarUrl: form.avatarUrl,
              interests: chipString(form.interests),
              wishlist: chipString(form.wishlist),
            });
          }}
        >
          <label>
            שם תצוגה
            <input
              value={form.displayName}
              onChange={(event) =>
                setForm({ ...form, displayName: event.target.value })
              }
            />
          </label>
          <label>
            עיר / אזור
            <input
              value={form.city}
              onChange={(event) => setForm({ ...form, city: event.target.value })}
            />
          </label>
          <label>
            תמונת פרופיל
            <input
              value={form.avatarUrl}
              onChange={(event) =>
                setForm({ ...form, avatarUrl: event.target.value })
              }
            />
          </label>
          <label>
            תחומי עניין
            <input
              value={form.interests}
              onChange={(event) =>
                setForm({ ...form, interests: event.target.value })
              }
            />
          </label>
          <label>
            Wishlist
            <input
              value={form.wishlist}
              onChange={(event) =>
                setForm({ ...form, wishlist: event.target.value })
              }
            />
          </label>
          <button className="primary-button">שמור שינויים</button>
        </form>
      </section>
      <section className="card">
        <div className="section-header">
          <h2>מועדפים</h2>
        </div>
        <div className="compact-list">
          {favorites.map((item) => (
            <div key={item.id} className="list-row">
              <div>
                <strong>{item.title}</strong>
                <p>
                  {item.category} · {item.city}
                </p>
              </div>
              <span className="pill">{item.status}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function AdminPage({ overview }) {
  return (
    <section className="card">
      <div className="section-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h2>מבט מהיר על המערכת</h2>
        </div>
      </div>
      <div className="stats-grid">
        {overview.stats.map((entry) => (
          <article key={entry.label} className="stat-card">
            <strong>{entry.value}</strong>
            <span>{entry.label}</span>
          </article>
        ))}
      </div>
      <div className="compact-list">
        {overview.latestTrades.map((trade) => (
          <div key={trade.id} className="list-row">
            <div>
              <strong>{trade.requested_item_title}</strong>
              <p>
                {trade.sender_name} ↔ {trade.receiver_name}
              </p>
            </div>
            <span className="pill">{trade.status_label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function TradeModal({ item, myItems, onClose, onSubmit }) {
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState("");

  if (!item) return null;

  function toggleItem(id) {
    setSelected((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="section-header">
          <div>
            <p className="eyebrow">שליחת הצעת טרייד</p>
            <h2>אני רוצה את {item.title}</h2>
          </div>
          <button className="ghost-button" onClick={onClose}>
            סגור
          </button>
        </div>
        <div className="compact-list">
          {myItems
            .filter((entry) => entry.status === "active")
            .map((entry) => (
              <label key={entry.id} className="checkbox-row">
                <input
                  type="checkbox"
                  checked={selected.includes(entry.id)}
                  onChange={() => toggleItem(entry.id)}
                />
                <span>
                  {entry.title} · {entry.category}
                </span>
              </label>
            ))}
        </div>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="היי, אני יכול להציע..."
        />
        <button
          className="primary-button"
          onClick={() =>
            onSubmit({
              requestedItemId: item.id,
              offeredItemIds: selected,
              message,
            })
          }
        >
          שלח הצעה
        </button>
      </div>
    </div>
  );
}

function ProtectedApp() {
  const navigate = useNavigate();
  const [auth, setAuth] = useState(() => ({
    token: localStorage.getItem("giventake_token"),
    user: null,
  }));
  const [items, setItems] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [inbox, setInbox] = useState({ received: [], sent: [] });
  const [notifications, setNotifications] = useState([]);
  const [admin, setAdmin] = useState({ stats: [], latestTrades: [] });
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    city: "",
    condition: "",
  });
  const [tradeItem, setTradeItem] = useState(null);

  async function refreshAll() {
    if (!localStorage.getItem("giventake_token")) return;
    const query = new URLSearchParams(
      Object.entries(filters).filter(([, value]) => value),
    ).toString();
    const [me, discover, mine, favs, inboxData, notificationsData, adminData] =
      await Promise.all([
        api.me(),
        api.getItems(query ? `?${query}` : ""),
        api.getItems("?mine=true"),
        api.getFavorites(),
        api.getInbox(),
        api.getNotifications(),
        api.getAdmin(),
      ]);

    setAuth({ token: localStorage.getItem("giventake_token"), user: me.user });
    setItems(discover.items);
    setMyItems(mine.items);
    setFavorites(favs.items);
    setInbox(inboxData);
    setNotifications(notificationsData.items);
    setAdmin(adminData);
  }

  useEffect(() => {
    if (auth.token) {
      refreshAll().catch(() => {
        localStorage.removeItem("giventake_token");
        setAuth({ token: null, user: null });
      });
    }
  }, [auth.token]);

  useEffect(() => {
    if (auth.token) {
      refreshAll().catch(() => {});
    }
  }, [filters.search, filters.category, filters.city, filters.condition]);

  function onAuthSuccess(data) {
    localStorage.setItem("giventake_token", data.token);
    setAuth({ token: data.token, user: data.user });
  }

  function logout() {
    localStorage.removeItem("giventake_token");
    setAuth({ token: null, user: null });
    navigate("/");
  }

  if (!auth.token) {
    return <AuthScreen onAuth={onAuthSuccess} />;
  }

  return (
    <AppShell
      user={auth.user}
      onLogout={logout}
      notificationsCount={notifications.filter((entry) => !entry.read_at).length}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/discover" replace />} />
        <Route
          path="/discover"
          element={
            <DiscoverPage
              items={items}
              filters={filters}
              setFilters={setFilters}
              onToggleFavorite={async (itemId) => {
                await api.toggleFavorite(itemId);
                await refreshAll();
              }}
              onOpenTrade={setTradeItem}
            />
          }
        />
        <Route
          path="/add"
          element={
            <AddItemPage
              onSubmit={async (payload) => {
                await api.createItem(payload);
                await refreshAll();
                navigate("/items");
              }}
            />
          }
        />
        <Route
          path="/items"
          element={
            <MyItemsPage
              items={myItems}
              onStatusChange={async (itemId, status) => {
                await api.updateItem(itemId, { status });
                await refreshAll();
              }}
            />
          }
        />
        <Route
          path="/inbox"
          element={
            <InboxPage
              inbox={inbox}
              onTradeAction={async (tradeId, status) => {
                await api.updateTrade(tradeId, { status });
                await refreshAll();
              }}
              onSendMessage={async (tradeId, content) => {
                await api.sendMessage(tradeId, { content });
                await refreshAll();
              }}
            />
          }
        />
        <Route
          path="/profile"
          element={
            <ProfilePage
              user={auth.user}
              favorites={favorites}
              onUpdate={async (payload) => {
                await api.updateProfile(payload);
                await refreshAll();
              }}
            />
          }
        />
        <Route path="/admin" element={<AdminPage overview={admin} />} />
      </Routes>
      <TradeModal
        item={tradeItem}
        myItems={myItems}
        onClose={() => setTradeItem(null)}
        onSubmit={async (payload) => {
          await api.createTrade(payload);
          setTradeItem(null);
          await refreshAll();
          navigate("/inbox");
        }}
      />
    </AppShell>
  );
}

export default function App() {
  return <ProtectedApp />;
}
