// server.js
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;
const API_KEY = process.env.AVIATIONSTACK_KEY; // NOTE: yahan VITE_ nahi hai

app.use(cors());

app.get("/api/airports", async (req, res) => {
  try {
    const { search = "", limit = 20, offset = 0 } = req.query;

    if (!API_KEY) {
      return res.status(500).json({ error: "AVIATIONSTACK_KEY not configured" });
    }

    const params = new URLSearchParams({
      access_key: API_KEY,
      limit: String(limit),
      offset: String(offset),
    });

    if (String(search).trim()) {
      params.append("search", String(search).trim());
    }

    const url = `http://api.aviationstack.com/v1/airports?${params.toString()}`;
    console.log("→ Hitting aviationstack:", url);

    const apiRes = await fetch(url);
    const json = await apiRes.json();

    if (!apiRes.ok || json.error) {
      console.error("Aviationstack error:", json.error || apiRes.statusText);
      return res
        .status(500)
        .json({ error: "Failed to fetch airports", details: json.error });
    }

    res.json(json.data || []);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ API proxy server running on http://localhost:${PORT}`);
});
