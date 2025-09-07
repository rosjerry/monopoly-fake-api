import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { LowSync } from "lowdb";
import { JSONFileSync } from "lowdb/node";
import { fileURLToPath } from "url";
const app = express();
const PORT = process.env.PORT || 3002;

// Enable CORS from everywhere
app.use(cors());
app.use(express.json());

// DB setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, "db.json");

function generateBoard() {
  const numbers = [];
  for (let value = 5; value <= 75; value += 5) {
    numbers.push(value);
  }

  const positions = Array.from({ length: 16 }, (_, index) => index);
  // Shuffle positions for randomness
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  const board = new Array(16).fill(null);
  // Random bonus position is the first in shuffled positions
  const bonusPos = positions[0];
  board[bonusPos] = "bonus";
  // Fill remaining positions with numbers 5..75
  for (let i = 0; i < 15; i++) {
    const pos = positions[i + 1];
    board[pos] = numbers[i];
  }
  return board;
}

// Ensure db.json exists and has a board
if (!fs.existsSync(DB_FILE)) {
  const initial = { board: generateBoard() };
  fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
}

// Initialize lowdb
const adapter = new JSONFileSync(DB_FILE);
const db = new LowSync(adapter, { board: [] });
db.read();
if (!db.data || !Array.isArray(db.data.board) || db.data.board.length !== 16) {
  db.data = { board: generateBoard() };
  db.write();
}

// /dicer route that returns array of 2 random numbers (1-6)
app.get("/dice", (req, res) => {
  const dice1 = Math.floor(Math.random() * 6) + 1;
  const dice2 = Math.floor(Math.random() * 6) + 1;

  res.json([dice1, dice2]);
});

// POST /restart: regenerate board and persist to json db
app.post("/restart", (req, res) => {
  const newBoard = generateBoard();
  db.read();
  db.data.board = newBoard;
  db.write();
  res.json({ board: db.data.board }).send("new board created");
});

// GET /board: return current board from db.json
app.get("/board", (_req, res) => {
  db.read();
  res.json(db.data.board);
});



// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
