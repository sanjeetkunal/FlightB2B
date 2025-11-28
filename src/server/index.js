// server/index.js
import express from "express";
import cors from "cors";
import aiChatRoute from "./aiChatRoute.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", aiChatRoute);

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
