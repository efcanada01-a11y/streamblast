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

app.post("/api/blast", async (req, res) => {
  try {
    const songUrl = req.body.songUrl;

    if (!songUrl || !songUrl.includes("spotify.com/track/")) {
      return res.status(400).json({ error: "Invalid Spotify URL" });
    }

    const trackId = songUrl.split("/track/")[1].split("?")[0];

    // ✅ CORRECT ENV USAGE
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    console.log("CLIENT ID:", clientId ? "Loaded" : "Missing");
    console.log("CLIENT SECRET:", clientSecret ? "Loaded" : "Missing");

    const authString = Buffer.from(
      `${clientId}:${clientSecret}`
    ).toString("base64");

    // 🔐 GET TOKEN
    const tokenResponse = await axios.post(
      "https://accounts.spotify.com/api/token",
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${authString}`,
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    const token = tokenResponse.data.access_token;

    // 🎵 GET TRACK DATA
    const trackData = await axios.get(
      `https://api.spotify.com/v1/tracks/${trackId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const song = trackData.data;

    res.json({
      success: true,
      artist: song.artists[0].name,
      title: song.name
    });

  } catch (error) {
    console.log("🔥 ERROR:", error.response?.data || error.message);

    res.status(500).json({
      error: "Spotify API failed",
      details: error.response?.data || error.message
    });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
