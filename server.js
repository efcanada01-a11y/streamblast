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
    const trackId = songUrl.split("/track/")[1].split("?")[0];

    const authString = Buffer.from(
      `${process.env.543b27044b01461497ac1f672d9eed85}:${process.env.24146b4c5ad1460680f49f25fe19f477}`
    ).toString("base64");

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

    const trackData = await axios.get(
      `https://api.spotify.com/v1/tracks/${trackId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    res.json({
      success: true,
      song: `${trackData.data.artists[0].name} - ${trackData.data.name}`
    });
  } catch (error) {
    res.status(500).json({
      error: "Spotify API failed",
      details: error.response?.data || error.message
    });
  }
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
