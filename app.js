const express = require('express');
const session = require('express-session');
const fs = require('fs-extra');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;
const USERS_FILE = 'users.json';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false
}));

// Load or initialize users
let users = [];
if (fs.existsSync(USERS_FILE)) {
  users = fs.readJsonSync(USERS_FILE);
}

// Save users helper
function saveUsers() {
  fs.writeJsonSync(USERS_FILE, users, { spaces: 2 });
}

// Auth middleware
function requireLogin(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}

// Routes
app.get('/', (req, res) => res.redirect('/dashboard'));

app.get('/register', (req, res) => res.render('register'));
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.send('Username taken.');
  }
  const user = { id: Date.now(), username, password, level: 1, platforms: [] };
  users.push(user);
  saveUsers();
  req.session.userId = user.id;
  res.redirect('/dashboard');
});

app.get('/login', (req, res) => res.render('login'));
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.send('Invalid login');
  req.session.userId = user.id;
  res.redirect('/dashboard');
});

app.get('/dashboard', requireLogin, (req, res) => {
  const user = users.find(u => u.id === req.session.userId);
  res.render('dashboard', { user });
});

app.post('/dashboard', requireLogin, (req, res) => {
  const user = users.find(u => u.id === req.session.userId);
  user.level = parseInt(req.body.level) || 1;
  user.platforms = req.body.platforms || [];
  if (!Array.isArray(user.platforms)) user.platforms = [user.platforms];
  saveUsers();
  res.redirect('/dashboard');
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

app.get('/supporters.json', (req, res) => {
  const publicList = users.map(u => ({
    name: u.username,
    level: u.level,
    icons: u.platforms
  }));
  res.json(publicList);
});

app.listen(PORT, () => {
  console.log(`Supporter app running at http://localhost:${PORT}`);
});
