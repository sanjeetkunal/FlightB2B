// amadeus-server.js
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5002;

app.get("/api/amadeus/airports", (req, res) => {
  res.json([
    {
      iataCode: "DEL",
      name: "Indira Gandhi International Airport",
      address: { cityName: "New Delhi", countryName: "India" },
    },
  ]);
});

app.listen(PORT, () => {
  console.log(`✅ Amadeus proxy running at http://localhost:${PORT}`);
});
