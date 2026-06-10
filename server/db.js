import fs from "fs";
import path from "path";
import initSqlJs from "sql.js";
import bcrypt from "bcryptjs";

const dataDir = path.resolve("server", "data");
const dbFile = path.join(dataDir, "giventake.sqlite");

let db;

function parseJson(value, fallback = []) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function run(statement, params = []) {
  db.run(statement, params);
  persist();
}

function query(statement, params = []) {
  const result = db.exec(statement, params);
  if (!result.length) return [];
  const [{ columns, values }] = result;
  return values.map((row) =>
    Object.fromEntries(columns.map((column, index) => [column, row[index]])),
  );
}

function one(statement, params = []) {
  return query(statement, params)[0] || null;
}

function persist() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(dbFile, Buffer.from(db.export()));
}

function seedDatabase() {
  const existing = one("SELECT COUNT(*) AS count FROM users");
  if (existing?.count > 0) return;

  const password = bcrypt.hashSync("123456", 10);

  run(
    "INSERT INTO users (email, password_hash, display_name, city, avatar_url, interests_json, wishlist_json, is_admin, completed_trades) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      "demo@giventake.app",
      password,
      "נועה כהן",
      "תל אביב",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
      JSON.stringify(["ספרים", "תאורה", "גיימינג"]),
      JSON.stringify(["מנורת לילה", "כיסא עץ", "מקלדת"]),
      1,
      4,
    ],
  );
  run(
    "INSERT INTO users (email, password_hash, display_name, city, avatar_url, interests_json, wishlist_json, is_admin, completed_trades) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      "maya@giventake.app",
      password,
      "מאיה לוי",
      "רמת גן",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80",
      JSON.stringify(["עיצוב", "ריהוט", "ספרים"]),
      JSON.stringify(["שרפרף", "אגרטל", "ספרי עיצוב"]),
      0,
      2,
    ],
  );
  run(
    "INSERT INTO users (email, password_hash, display_name, city, avatar_url, interests_json, wishlist_json, is_admin, completed_trades) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      "ori@giventake.app",
      password,
      "אורי בן דוד",
      "גבעתיים",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
      JSON.stringify(["כלי עבודה", "אלקטרוניקה"]),
      JSON.stringify(["מקדחה", "אוזניות"]),
      0,
      6,
    ],
  );

  run(
    "INSERT INTO items (owner_id, title, description, category, condition, city, status, desired_text, desired_categories_json, images_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))",
    [
      2,
      "כיסא עץ וינטג׳",
      "כיסא יציב עם כמה סימני שימוש קלים.",
      "ריהוט",
      "טוב",
      "רמת גן",
      "active",
      "אשמח למנורה קטנה או ספרי עיצוב.",
      JSON.stringify(["תאורה", "ספרים"]),
      JSON.stringify([
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
      ]),
    ],
  );
  run(
    "INSERT INTO items (owner_id, title, description, category, condition, city, status, desired_text, desired_categories_json, images_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))",
    [
      3,
      "מנורת שולחן שחורה",
      "מנורה עובדת מצוין, מתאימה לפינת עבודה.",
      "תאורה",
      "כמו חדש",
      "גבעתיים",
      "active",
      "מחפש גאדג׳טים או אוזניות.",
      JSON.stringify(["אלקטרוניקה", "גיימינג"]),
      JSON.stringify([
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
      ]),
    ],
  );
  run(
    "INSERT INTO items (owner_id, title, description, category, condition, city, status, desired_text, desired_categories_json, images_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))",
    [
      1,
      "סט ספרי פנטזיה",
      "שלושה ספרים במצב טוב מאוד.",
      "ספרים",
      "טוב",
      "תל אביב",
      "active",
      "אשמח לקבל תאורה לחדר או כלי עבודה קטנים.",
      JSON.stringify(["תאורה", "כלי עבודה"]),
      JSON.stringify([
        "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=900&q=80",
      ]),
    ],
  );

  run(
    "INSERT INTO favorites (user_id, item_id, created_at) VALUES (?, ?, datetime('now'))",
    [1, 1],
  );
}

export async function initDb() {
  const SQL = await initSqlJs({});
  if (fs.existsSync(dbFile)) {
    db = new SQL.Database(fs.readFileSync(dbFile));
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      city TEXT NOT NULL,
      avatar_url TEXT,
      interests_json TEXT DEFAULT '[]',
      wishlist_json TEXT DEFAULT '[]',
      is_admin INTEGER DEFAULT 0,
      completed_trades INTEGER DEFAULT 0,
      blocked INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      condition TEXT NOT NULL,
      city TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      desired_text TEXT DEFAULT '',
      desired_categories_json TEXT DEFAULT '[]',
      images_json TEXT DEFAULT '[]',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS favorites (
      user_id INTEGER NOT NULL,
      item_id INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, item_id)
    );

    CREATE TABLE IF NOT EXISTS trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      requested_item_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      message TEXT DEFAULT '',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS trade_items (
      trade_id INTEGER NOT NULL,
      item_id INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trade_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      read_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedDatabase();
}

function hydrateUser(user) {
  if (!user) return null;
  return {
    ...user,
    is_admin: Boolean(user.is_admin),
    interests: parseJson(user.interests_json),
    wishlist: parseJson(user.wishlist_json),
  };
}

function hydrateItem(item) {
  if (!item) return null;
  const images = parseJson(item.images_json);
  return {
    ...item,
    images,
    desired_categories: parseJson(item.desired_categories_json),
    primary_image: images[0] || null,
  };
}

export const store = {
  query,
  one,
  run,
  createUser(payload) {
    run(
      "INSERT INTO users (email, password_hash, display_name, city, avatar_url, interests_json, wishlist_json, is_admin, completed_trades) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)",
      [
        payload.email,
        payload.passwordHash,
        payload.displayName,
        payload.city,
        payload.avatarUrl || "",
        JSON.stringify(payload.interests || []),
        JSON.stringify(payload.wishlist || []),
      ],
    );
    return hydrateUser(one("SELECT * FROM users WHERE email = ?", [payload.email]));
  },
  getUserByEmail(email) {
    return hydrateUser(one("SELECT * FROM users WHERE email = ?", [email]));
  },
  getUserById(id) {
    return hydrateUser(one("SELECT * FROM users WHERE id = ?", [id]));
  },
  updateUser(id, payload) {
    run(
      "UPDATE users SET display_name = ?, city = ?, avatar_url = ?, interests_json = ?, wishlist_json = ? WHERE id = ?",
      [
        payload.displayName,
        payload.city,
        payload.avatarUrl || "",
        JSON.stringify(payload.interests || []),
        JSON.stringify(payload.wishlist || []),
        id,
      ],
    );
    return this.getUserById(id);
  },
  listItems({ currentUserId, mine = false, search = "", category = "", city = "", condition = "" }) {
    let sql = `
      SELECT items.*, users.display_name AS owner_name,
      EXISTS(SELECT 1 FROM favorites WHERE favorites.user_id = ? AND favorites.item_id = items.id) AS is_favorite
      FROM items
      JOIN users ON users.id = items.owner_id
      WHERE items.status != 'deleted'
    `;
    const params = [currentUserId || 0];

    if (mine) {
      sql += " AND items.owner_id = ?";
      params.push(currentUserId);
    } else {
      sql += " AND items.owner_id != ?";
      params.push(currentUserId || 0);
      sql += " AND items.status = 'active'";
    }
    if (search) {
      sql += " AND (items.title LIKE ? OR items.description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      sql += " AND items.category = ?";
      params.push(category);
    }
    if (city) {
      sql += " AND items.city LIKE ?";
      params.push(`%${city}%`);
    }
    if (condition) {
      sql += " AND items.condition = ?";
      params.push(condition);
    }

    sql += " ORDER BY items.id DESC";

    const me = currentUserId ? this.getUserById(currentUserId) : null;
    return query(sql, params).map((item) => {
      const hydrated = hydrateItem(item);
      const score = (me?.interests || []).some((interest) =>
        [hydrated.category, hydrated.description, hydrated.desired_text]
          .join(" ")
          .includes(interest),
      )
        ? 1
        : 0;
      return {
        ...hydrated,
        is_favorite: Boolean(item.is_favorite),
        match_score: score,
      };
    });
  },
  createItem(userId, payload) {
    run(
      "INSERT INTO items (owner_id, title, description, category, condition, city, status, desired_text, desired_categories_json, images_json, created_at) VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, datetime('now'))",
      [
        userId,
        payload.title,
        payload.description,
        payload.category,
        payload.condition,
        payload.city,
        payload.desiredText || "",
        JSON.stringify(payload.desiredCategories || []),
        JSON.stringify(payload.images || []),
      ],
    );
    return hydrateItem(one("SELECT * FROM items ORDER BY id DESC LIMIT 1"));
  },
  updateItem(itemId, userId, payload) {
    const item = one("SELECT * FROM items WHERE id = ?", [itemId]);
    if (!item || item.owner_id !== userId) return null;
    run(
      "UPDATE items SET status = COALESCE(?, status), title = COALESCE(?, title), description = COALESCE(?, description), category = COALESCE(?, category), condition = COALESCE(?, condition), city = COALESCE(?, city), desired_text = COALESCE(?, desired_text), desired_categories_json = COALESCE(?, desired_categories_json), images_json = COALESCE(?, images_json) WHERE id = ?",
      [
        payload.status ?? null,
        payload.title ?? null,
        payload.description ?? null,
        payload.category ?? null,
        payload.condition ?? null,
        payload.city ?? null,
        payload.desiredText ?? null,
        payload.desiredCategories ? JSON.stringify(payload.desiredCategories) : null,
        payload.images ? JSON.stringify(payload.images) : null,
        itemId,
      ],
    );
    return hydrateItem(one("SELECT * FROM items WHERE id = ?", [itemId]));
  },
  toggleFavorite(userId, itemId) {
    const current = one(
      "SELECT * FROM favorites WHERE user_id = ? AND item_id = ?",
      [userId, itemId],
    );
    if (current) {
      run("DELETE FROM favorites WHERE user_id = ? AND item_id = ?", [userId, itemId]);
    } else {
      run(
        "INSERT INTO favorites (user_id, item_id, created_at) VALUES (?, ?, datetime('now'))",
        [userId, itemId],
      );
    }
  },
  listFavorites(userId) {
    return query(
      "SELECT items.* FROM favorites JOIN items ON items.id = favorites.item_id WHERE favorites.user_id = ? ORDER BY favorites.created_at DESC",
      [userId],
    ).map(hydrateItem);
  },
  createTrade(senderId, payload) {
    const requested = one("SELECT * FROM items WHERE id = ?", [payload.requestedItemId]);
    if (!requested || requested.status !== "active") {
      throw new Error("המוצר כבר לא פעיל");
    }
    run(
      "INSERT INTO trades (requested_item_id, sender_id, receiver_id, status, message, created_at, updated_at) VALUES (?, ?, ?, 'pending', ?, datetime('now'), datetime('now'))",
      [payload.requestedItemId, senderId, requested.owner_id, payload.message || ""],
    );
    const trade = one("SELECT * FROM trades ORDER BY id DESC LIMIT 1");
    (payload.offeredItemIds || []).forEach((itemId) => {
      run("INSERT INTO trade_items (trade_id, item_id) VALUES (?, ?)", [trade.id, itemId]);
    });
    if (payload.message) {
      run(
        "INSERT INTO messages (trade_id, sender_id, content, created_at) VALUES (?, ?, ?, datetime('now'))",
        [trade.id, senderId, payload.message],
      );
    }
    run("UPDATE items SET status = 'pending_trade' WHERE id = ?", [requested.id]);
    run(
      "INSERT INTO notifications (user_id, type, content, created_at) VALUES (?, 'trade', ?, datetime('now'))",
      [requested.owner_id, "קיבלת הצעת טרייד חדשה"],
    );
    return trade;
  },
  updateTrade(userId, tradeId, status) {
    const trade = one("SELECT * FROM trades WHERE id = ?", [tradeId]);
    if (!trade) return null;
    if (![trade.sender_id, trade.receiver_id].includes(userId)) return null;
    run(
      "UPDATE trades SET status = ?, updated_at = datetime('now') WHERE id = ?",
      [status, tradeId],
    );
    if (status === "accepted") {
      run(
        "INSERT INTO notifications (user_id, type, content, created_at) VALUES (?, 'trade', ?, datetime('now'))",
        [trade.sender_id, "ההצעה שלך אושרה"],
      );
    }
    if (["rejected", "cancelled"].includes(status)) {
      run("UPDATE items SET status = 'active' WHERE id = ?", [trade.requested_item_id]);
    }
    if (status === "completed") {
      run("UPDATE items SET status = 'traded' WHERE id = ?", [trade.requested_item_id]);
      run(
        "UPDATE users SET completed_trades = completed_trades + 1 WHERE id IN (?, ?)",
        [trade.sender_id, trade.receiver_id],
      );
    }
    return one("SELECT * FROM trades WHERE id = ?", [tradeId]);
  },
  addMessage(userId, tradeId, content) {
    const trade = one("SELECT * FROM trades WHERE id = ?", [tradeId]);
    if (!trade || ![trade.sender_id, trade.receiver_id].includes(userId)) return null;
    run(
      "INSERT INTO messages (trade_id, sender_id, content, created_at) VALUES (?, ?, ?, datetime('now'))",
      [tradeId, userId, content],
    );
    const target = trade.sender_id === userId ? trade.receiver_id : trade.sender_id;
    run(
      "INSERT INTO notifications (user_id, type, content, created_at) VALUES (?, 'message', ?, datetime('now'))",
      [target, "יש לך הודעה חדשה בצ׳אט טרייד"],
    );
  },
  listTradeMessages(tradeId) {
    return query(
      "SELECT messages.*, users.display_name AS sender_name FROM messages JOIN users ON users.id = messages.sender_id WHERE messages.trade_id = ? ORDER BY messages.id ASC",
      [tradeId],
    );
  },
  listInbox(userId) {
    const trades = query(
      `SELECT trades.*, requested.title AS requested_item_title,
        sender.display_name AS sender_name,
        receiver.display_name AS receiver_name
      FROM trades
      JOIN items AS requested ON requested.id = trades.requested_item_id
      JOIN users AS sender ON sender.id = trades.sender_id
      JOIN users AS receiver ON receiver.id = trades.receiver_id
      WHERE trades.sender_id = ? OR trades.receiver_id = ?
      ORDER BY trades.updated_at DESC`,
      [userId, userId],
    );

    const mapTrade = (trade) => {
      const offered = query(
        "SELECT items.title FROM trade_items JOIN items ON items.id = trade_items.item_id WHERE trade_items.trade_id = ?",
        [trade.id],
      ).map((entry) => entry.title);
      return {
        ...trade,
        offered_titles: offered.length ? offered : ["הודעה בלבד"],
        status_label: trade.status,
        messages: this.listTradeMessages(trade.id),
      };
    };

    return {
      received: trades
        .filter((trade) => trade.receiver_id === userId)
        .map(mapTrade),
      sent: trades.filter((trade) => trade.sender_id === userId).map(mapTrade),
    };
  },
  listNotifications(userId) {
    return query(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 20",
      [userId],
    );
  },
  getAdminOverview() {
    const usersCount = one("SELECT COUNT(*) AS value FROM users")?.value || 0;
    const itemsCount = one("SELECT COUNT(*) AS value FROM items")?.value || 0;
    const tradesCount = one("SELECT COUNT(*) AS value FROM trades")?.value || 0;
    const completedCount =
      one("SELECT COUNT(*) AS value FROM trades WHERE status = 'completed'")?.value || 0;

    const latestTrades = query(
      `SELECT trades.id, trades.status, requested.title AS requested_item_title,
        sender.display_name AS sender_name, receiver.display_name AS receiver_name
      FROM trades
      JOIN items AS requested ON requested.id = trades.requested_item_id
      JOIN users AS sender ON sender.id = trades.sender_id
      JOIN users AS receiver ON receiver.id = trades.receiver_id
      ORDER BY trades.id DESC
      LIMIT 10`,
    ).map((trade) => ({ ...trade, status_label: trade.status }));

    return {
      stats: [
        { label: "משתמשים", value: usersCount },
        { label: "מוצרים", value: itemsCount },
        { label: "הצעות", value: tradesCount },
        { label: "הושלמו", value: completedCount },
      ],
      latestTrades,
    };
  },
};
