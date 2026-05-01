const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, ".")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/api/blast", (req, res) => {
  res.json({
    success: true,
    song: "Test Song",
    submittedTo: 27,
    message: "Local test worked. Spotify not enabled yet."
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log("Server running at http://localhost:3000");
});
