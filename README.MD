# Monopoly Fake API

A fake API for a Monopoly-style dice game built with Express.js and LowDB. This API simulates a board game where players can make bets, roll dice, and win prizes including bonus rounds.

## Features

- 🎲 Dice rolling mechanics
- 💰 Balance management with betting system
- 🎁 Prize system with bonus rounds
- 🎯 16-position board with randomized prizes
- 🔄 Game state persistence
- 🎪 Bonus mode with free spins

## Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

## Installation

### 1. Install Dependencies

First, clone the repository and install the required dependencies:

```bash
# Clone the repository (if not already done)
git clone https://github.com/rosjerry/monopoly-fake-api.git
cd monopoly-fake-api

# Install dependencies
npm install
```

This will install the following packages:
- `express` - Web framework for Node.js
- `cors` - Cross-Origin Resource Sharing middleware
- `lowdb` - Small local JSON database
- `json-server` - Development tool for quick REST API (dev dependency)

### 2. Database Setup

The database is automatically set up when you first run the application. The `db.json` file will be created with:

- A randomized 16-position board with prizes (5-75 in increments of 5) and one bonus position
- Initial game state with:
  - Starting balance: 500
  - Position: 0
  - Available to spin: true
  - Bonus mode: false
  - Free spin amount: 0

If you want to reset the database manually, you can delete the `db.json` file and it will be regenerated on the next startup.

### 3. Start the Project

Run the application using npm:

```bash
npm start
```

The server will start on port 3002 (or the port specified in the PORT environment variable).

You should see:
```
Server running on port 3002
```

## API Endpoints

### GET `/makebet`
Returns the current game state without performing a roll.

**Response:**
```json
{
  "balance": 500,
  "dice_result": [],
  "last_prize_won": null,
  "available_to_spin": true,
  "bonus_mode_board": null,
  "bonus_mode": false,
  "freespin_amount": 0,
  "regular_mode_board": [5, 10, 15, ..., "bonus", ...]
}
```

### POST `/roll`
Performs a dice roll and updates the game state. Costs 50 balance (unless in bonus mode).

**Response:**
```json
{
  "dice_result": [3, 4]
}
```

### POST `/reset-game`
Resets the game to initial state with a new randomized board.

**Response:**
```json
{
  "balance": 500,
  "dice_result": [],
  "last_prize_won": null,
  "available_to_spin": true,
  "bonus_mode_board": null,
  "bonus_mode": false,
  "freespin_amount": 0,
  "regular_mode_board": [5, 10, 15, ..., "bonus", ...]
}
```

## Game Rules

1. **Regular Mode:**
   - Each roll costs 50 balance
   - Dice roll determines movement (1-12 spaces)
   - Landing on a number wins that amount
   - Landing on "bonus" triggers bonus mode

2. **Bonus Mode:**
   - 3 free spins
   - All prizes are multiplied by 5
   - No cost per spin
   - Returns to regular mode after 3 spins

3. **Balance Management:**
   - Starting balance: 500
   - Cannot spin if balance < 50 (unless in bonus mode)
   - Winnings are added to balance

## Development

### Using JSON Server (Alternative)

You can also run the project using json-server for development:

```bash
npm run db
```

This will start json-server on port 3003 with the `db.json` file.

### Project Structure

```
monopoly-fake-api/
├── index.js          # Main application file
├── db.json          # Database file (auto-generated)
├── package.json     # Dependencies and scripts
└── README.MD        # This file
```

## Environment Variables

- `PORT` - Server port (default: 3002)

## License

ISC
