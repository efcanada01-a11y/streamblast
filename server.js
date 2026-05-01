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

// 🚀 BLAST ENDPOINT
app.post("/api/blast", async (req, res) => {
  const { songUrl } = req.body;

  if (!songUrl || !songUrl.includes("spotify.com/track/")) {
    return res.status(400).json({ error: "Invalid Spotify URL" });
  }

  try {
    const trackId = songUrl.split("/track/")[1].split("?")[0];

    // 🔐 FIXED TOKEN REQUEST (IMPORTANT CHANGE HERE)
    const tokenResponse = await axios({
      method: "post",
      url: "https://accounts.spotify.com/api/token",
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
      data: "grant_type=client_credentials",
    });

    const token = tokenResponse.data.access_token;

    // 🎵 GET TRACK
    const trackResponse = await axios.get(
      `https://api.spotify.com/v1/tracks/${trackId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const song = trackResponse.data;

    console.log("SPOTIFY RESPONSE OK");

    res.json({
      success: true,
      artist: song?.artists?.[0]?.name || "Unknown Artist",
      title: song?.name || "Unknown Title",
    });

  } catch (err) {
  console.log("🔥 FULL SPOTIFY ERROR START 🔥");
  console.log("STATUS:", err.response?.status);
  console.log("DATA:", err.response?.data);
  console.log("MESSAGE:", err.message);
  console.log("🔥 FULL SPOTIFY ERROR END 🔥");

  return res.status(500).json({
    error: "Spotify API failed (check server logs)"
  });
}
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log("🚀 StreamBlast running at http://localhost:3000");
});
