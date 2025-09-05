const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS from everywhere
app.use(cors());

// /dicer route that returns array of 2 random numbers (1-6)
app.get("/dice", (req, res) => {
  const dice1 = Math.floor(Math.random() * 6) + 1;
  const dice2 = Math.floor(Math.random() * 6) + 1;

  res.json([dice1, dice2]);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
