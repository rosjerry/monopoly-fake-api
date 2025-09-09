# Monopoly Fake API

A fake API for a Monopoly-style dice game built with Express.js and LowDB.

## Setup Instructions

### 1. Install Dependencies

Clone the repository and navigate to the project directory:

```bash
git clone https://github.com/rosjerry/monopoly-fake-api.git
cd monopoly-fake-api
```

Install the required node modules:

```bash
npm install
```

### 2. Set Up Database

Run the database server:

```bash
npm run db
```

### 3. Start the Project

Launch the application:

```bash
npm start
```

The server will start on port 3002.

## API Endpoints

- `GET /makebet` - Get current game state
- `POST /roll` - Roll dice and update game state  
- `POST /reset-game` - Reset game to initial state