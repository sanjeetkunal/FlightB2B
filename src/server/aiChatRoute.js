// server/aiChatRoute.js
import express from "express";
import OpenAI from "openai";

const router = express.Router();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Chat handler
router.post("/ai-chat", async (req, res) => {
  try {
    const { messages, context } = req.body;

    // System prompt: tumhara flight portal ka role
    const systemMessage = {
      role: "system",
      content:
        "You are an AI assistant for a B2B flight booking portal. " +
        "Help users with how to search flights, select fares, fill passenger details, and complete ticket booking. " +
        "Explain in simple Hinglish (mix of Hindi and English). If user asks for exact steps, refer to generic steps, not internal URLs.",
    };

    const allMessages = [systemMessage, ...messages];

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: allMessages,
    });

    const reply =
      response.output[0].content[0].text; // latest Responses API format, text output :contentReference[oaicite:1]{index=1}

    res.json({ reply });
  } catch (err) {
    console.error("AI chat error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
