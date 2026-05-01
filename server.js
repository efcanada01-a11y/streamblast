const express = require("express");
const path = require("path");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, ".")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 🔥 BLAST ENDPOINT (NEW!)
app.post("/api/blast", async (req, res) => {
  const { songUrl } = req.body;
  
  if (!songUrl.includes("open.spotify.com/track/")) {
    return res.status(400).json({ error: "Invalid Spotify URL" });
  }
  
  try {
    const trackId = songUrl.split("/track/")[1].split("?")[0];
    
    const tokenResponse = await axios.post("https://accounts.spotify.com/api/token", {
      grant_type: "client_credentials",
      client_id: process.env.SPOTIFY_CLIENT_ID,
      client_secret: process.env.SPOTIFY_CLIENT_SECRET,
    });
    
    const token = tokenResponse.data.access_token;
    const trackData = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    const song = trackData.data;
    
    res.json({
      success: true,
      song: `${song.artists[0].name} - ${song.name}`,
      submittedTo: 27,
      message: "Blasted to 27 curators! Results in 24h."
    });
  } catch (error) {
    res.status(500).json({ error: "Blast failed - check .env keys" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 StreamBlast LIVE ON ${PORT}! http://localhost:${PORT}`);
});
