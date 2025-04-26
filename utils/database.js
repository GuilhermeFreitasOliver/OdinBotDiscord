const fs = require('fs');
const path = require('path');

// Path to the JSON file that will store our database
const DB_PATH = path.join(__dirname, '../data/database.json');

// Ensure the data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database if it doesn't exist
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({
    users: {}
  }), 'utf8');
}

// Read the database
function readDatabase() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return { users: {} };
  }
}

// Write to the database
function writeDatabase(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing to database:', error);
    return false;
  }
}

// Get user data
function getUser(userId) {
  const db = readDatabase();
  if (!db.users[userId]) {
    db.users[userId] = {
      balance: 0,
      inventory: [],
      lastDaily: null
    };
    writeDatabase(db);
  }
  return db.users[userId];
}

// Update user data
function updateUser(userId, userData) {
  const db = readDatabase();
  db.users[userId] = userData;
  return writeDatabase(db);
}

// Economy functions
function addBalance(userId, amount) {
  const user = getUser(userId);
  user.balance += amount;
  return updateUser(userId, user);
}

function removeBalance(userId, amount) {
  const user = getUser(userId);
  if (user.balance >= amount) {
    user.balance -= amount;
    return updateUser(userId, user);
  }
  return false;
}

function getBalance(userId) {
  const user = getUser(userId);
  return user.balance;
}

module.exports = {
  getUser,
  updateUser,
  addBalance,
  removeBalance,
  getBalance
};