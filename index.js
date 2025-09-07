import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { LowSync } from "lowdb";
import { JSONFileSync } from "lowdb/node";
import { fileURLToPath } from "url";
const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, "db.json");

function generateBoard() {
  const numbers = [];
  for (let value = 5; value <= 75; value += 5) {
    numbers.push(value);
  }

  const positions = Array.from({ length: 16 }, (_, index) => index);
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  const board = new Array(16).fill(null);
  const bonusPos = positions[0];
  board[bonusPos] = "bonus";
  for (let i = 0; i < 15; i++) {
    const pos = positions[i + 1];
    board[pos] = numbers[i];
  }
  return board;
}

if (!fs.existsSync(DB_FILE)) {
  const initial = {
    board: generateBoard(),
    state: {
      balance: 100,
      position: 0,
      available_to_spin: true,
      bonus_mode: false,
      freespin_amount: 0,
      last_prize_won: null,
      dice_result: [],
      bonus_mode_board: null
    }
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
}

const adapter = new JSONFileSync(DB_FILE);
const db = new LowSync(adapter, { board: [], state: {} });
db.read();
if (!db.data || !Array.isArray(db.data.board) || db.data.board.length !== 16) {
  const next = db.data && typeof db.data === 'object' ? db.data : {};
  db.data = {
    ...next,
    board: generateBoard(),
    state: {
      balance: 100,
      position: 0,
      available_to_spin: true,
      bonus_mode: false,
      freespin_amount: 0,
      last_prize_won: null,
      dice_result: [],
      bonus_mode_board: null
    }
  };
  db.write();
}

// Ensure state exists if DB already had only board from older version
if (!db.data.state) {
  db.data.state = {
    balance: 100,
    position: 0,
    available_to_spin: true,
    bonus_mode: false,
    freespin_amount: 0,
    last_prize_won: null,
    dice_result: [],
    bonus_mode_board: null
  };
  db.write();
}

function rollDicePair() {
  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  return [d1, d2];
}

function createBonusBoardFrom(board) {
  return board.map((value) => (value === "bonus" ? 10 : (typeof value === 'number' ? value * 10 : value)));
}

function regenerateRegularBoardKeepingBonus() {
  return generateBoard();
}

app.get("/makebet", (req, res) => {
  db.read();
  const state = db.data.state || {};
  let { balance, position, bonus_mode, freespin_amount } = state;
  let { board } = db.data;

  const dice = rollDicePair();
  const diceSum = dice[0] + dice[1];
  position = ((position || 0) + diceSum) % 16;

  let lastPrizeWon = null;
  let bonusModeBoard = state.bonus_mode_board || null;

  if (bonus_mode) {
    // Bonus spins do not cost, only add prize; freespin decreases
    const prize = Array.isArray(bonusModeBoard) ? bonusModeBoard[position] : null;
    const prizeValue = typeof prize === 'number' ? prize : (prize === 'bonus' ? 10 : 0);
    balance = (balance || 0) + prizeValue;
    lastPrizeWon = prizeValue || prize;
    freespin_amount = Math.max(0, (freespin_amount || 0) - 1);
    if (freespin_amount === 0) {
      bonus_mode = false;
      bonusModeBoard = null;
    }
  } else {
    // Regular mode: costs 50 to spin
    balance = (balance || 0) - 50;
    const landed = board[position];
    if (landed === "bonus") {
      lastPrizeWon = "bonus";
      bonusModeBoard = createBonusBoardFrom(board);
      bonus_mode = true;
      freespin_amount = 3;
      // Regenerate the regular board to be used after bonus ends
      board = regenerateRegularBoardKeepingBonus();
    } else if (typeof landed === 'number') {
      balance += landed;
      lastPrizeWon = landed;
    } else {
      lastPrizeWon = null;
    }
  }

  const availableToSpin = bonus_mode ? (freespin_amount > 0) : (balance > 50);

  const response = {
    balance,
    dice_result: dice,
    last_prize_won: lastPrizeWon,
    available_to_spin: availableToSpin,
    bonus_mode_board: bonusModeBoard,
    bonus_mode,
    freespin_amount,
    regular_mode_board: board
  };

  db.data.board = board;
  db.data.state = {
    balance,
    position,
    available_to_spin: availableToSpin,
    bonus_mode,
    freespin_amount,
    last_prize_won: lastPrizeWon,
    dice_result: dice,
    bonus_mode_board: bonusModeBoard
  };
  db.write();

  console.log(JSON.stringify(response, null, 2))
  res.json(response);
});



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Reset game state and regenerate a fresh regular board
app.post("/reset-game", (req, res) => {
  db.read();

  const board = generateBoard();
  const state = {
    balance: 100,
    position: 0,
    available_to_spin: true,
    bonus_mode: false,
    freespin_amount: 0,
    last_prize_won: null,
    dice_result: [],
    bonus_mode_board: null
  };

  db.data.board = board;
  db.data.state = state;
  db.write();

  const response = {
    balance: state.balance,
    dice_result: state.dice_result,
    last_prize_won: state.last_prize_won,
    available_to_spin: state.available_to_spin,
    bonus_mode_board: state.bonus_mode_board,
    bonus_mode: state.bonus_mode,
    freespin_amount: state.freespin_amount,
    regular_mode_board: board
  };

  res.json(response);
});
