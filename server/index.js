import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
import { initDb, store } from "./db.js";

const app = express();
const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET || "giventake-mvp-secret";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "..", "dist");

app.use(cors());
app.use(express.json({ limit: "10mb" }));

function authRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ error: "נדרשת התחברות" });
  }

  try {
    const token = header.replace("Bearer ", "");
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = store.getUserById(payload.userId);
    if (!req.user) {
      return res.status(401).json({ error: "משתמש לא נמצא" });
    }
    next();
  } catch {
    res.status(401).json({ error: "session לא תקין" });
  }
}

function toAuthResponse(user) {
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
  return { token, user };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/register", (req, res) => {
  const { email, password, displayName, city, interests, wishlist, avatarUrl } = req.body;
  if (!email || !password || !displayName || !city) {
    return res.status(400).json({ error: "חסרים שדות חובה" });
  }
  if (store.getUserByEmail(email)) {
    return res.status(400).json({ error: "האימייל כבר קיים" });
  }
  const user = store.createUser({
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    displayName,
    city,
    interests,
    wishlist,
    avatarUrl,
  });
  res.json(toAuthResponse(user));
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = store.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: "אימייל או סיסמה לא נכונים" });
  }
  if (!bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "אימייל או סיסמה לא נכונים" });
  }
  res.json(toAuthResponse(user));
});

app.get("/api/auth/me", authRequired, (req, res) => {
  res.json({ user: req.user });
});

app.put("/api/profile", authRequired, (req, res) => {
  const user = store.updateUser(req.user.id, req.body);
  res.json({ user });
});

app.get("/api/items", authRequired, (req, res) => {
  const items = store.listItems({
    currentUserId: req.user.id,
    mine: req.query.mine === "true",
    search: req.query.search || "",
    category: req.query.category || "",
    city: req.query.city || "",
    condition: req.query.condition || "",
  });
  res.json({ items });
});

app.post("/api/items", authRequired, (req, res) => {
  const item = store.createItem(req.user.id, req.body);
  res.json({ item });
});

app.put("/api/items/:id", authRequired, (req, res) => {
  const item = store.updateItem(Number(req.params.id), req.user.id, req.body);
  if (!item) {
    return res.status(404).json({ error: "מוצר לא נמצא" });
  }
  res.json({ item });
});

app.post("/api/favorites/:itemId", authRequired, (req, res) => {
  store.toggleFavorite(req.user.id, Number(req.params.itemId));
  res.json({ ok: true });
});

app.get("/api/favorites", authRequired, (req, res) => {
  res.json({ items: store.listFavorites(req.user.id) });
});

app.post("/api/trades", authRequired, (req, res) => {
  try {
    const trade = store.createTrade(req.user.id, req.body);
    res.json({ trade });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put("/api/trades/:id", authRequired, (req, res) => {
  const trade = store.updateTrade(req.user.id, Number(req.params.id), req.body.status);
  if (!trade) {
    return res.status(404).json({ error: "טרייד לא נמצא" });
  }
  res.json({ trade });
});

app.get("/api/trades/inbox", authRequired, (req, res) => {
  res.json(store.listInbox(req.user.id));
});

app.post("/api/trades/:id/messages", authRequired, (req, res) => {
  if (!req.body.content) {
    return res.status(400).json({ error: "יש לכתוב הודעה" });
  }
  store.addMessage(req.user.id, Number(req.params.id), req.body.content);
  res.json({ ok: true });
});

app.get("/api/notifications", authRequired, (req, res) => {
  res.json({ items: store.listNotifications(req.user.id) });
});

app.get("/api/admin/overview", authRequired, (req, res) => {
  if (!req.user.is_admin) {
    return res.status(403).json({ error: "אין הרשאה" });
  }
  res.json(store.getAdminOverview());
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`GivenTake API listening on http://localhost:${PORT}`);
  });
});
