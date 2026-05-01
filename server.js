const express = require("express");
const path = require("path");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 🎯 REAL SPOTIFY API CONNECTION
app.post("/api/blast", async (req, res) => {
  const { songUrl } = req.body;

  if (!songUrl || !songUrl.includes("spotify.com/track/")) {
    return res.status(400).json({ error: "Invalid Spotify URL" });
  }

  try {
    const trackId = songUrl.split("/track/")[1].split("?")[0];

    // 🔐 GET ACCESS TOKEN
    const tokenResponse = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({ grant_type: "client_credentials" }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(
              process.env.SPOTIFY_CLIENT_ID +
              ":" +
              process.env.SPOTIFY_CLIENT_SECRET
            ).toString("base64"),
        },
      }
    );

    const token = tokenResponse.data.access_token;

    // 🎵 GET SONG DATA
    const trackResponse = await axios.get(
      `https://api.spotify.com/v1/tracks/${trackId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const song = trackResponse.data;

    res.json({
      artist: song.artists[0].name,
      title: song.name,
      success: true,
    });

  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Spotify API failed" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log("🚀 StreamBlast running at http://localhost:3000");
});
