const express = require("express");
const path = require("path");
const app = express();

// 🎯 THIS LINE SERVES YOUR FILES
app.use(express.static(path.join(__dirname, ".")));

// 🎯 HOME PAGE
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log("\n🚀🚀 StreamBlast LIVE ON " + PORT + "!");
  console.log("📱 Brave: http://localhost:3000");
  console.log("💰 Ready for $$$ TikToks!\n");
});
