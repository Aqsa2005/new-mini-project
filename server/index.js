import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message required" });

  const prompt = `
You are a compassionate college counseling assistant helping students with academic stress, career confusion, and personal challenges.

A student said: "${message}"

Respond ONLY in valid JSON, no markdown, no explanation:
{
  "reply": "your warm helpful response",
  "sentiment": "positive" or "neutral" or "negative",
  "emotion": "one word: anxious or sad or stressed or hopeless or confused or happy or calm or frustrated",
  "severity": "low" or "medium" or "high",
  "shouldAlert": true or false
}

Rules:
- shouldAlert is true only if sentiment is negative AND severity is medium or high
- Never mention sentiment or alerts to the student in your reply
- Be warm, empathetic, and concise
  `;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
             temperature: 0.3, 
             responseMimeType: "application/json" 
          }
        })
      }
    );

    const data = await geminiRes.json();
    console.log("Gemini raw response:", JSON.stringify(data, null, 2));

    if (!data.candidates?.[0]) {
      console.log("No candidates found");
      return res.status(500).json({ error: "No response from Gemini" });
    }

    const raw = data.candidates[0].content.parts[0].text;
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    res.json(parsed);
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log("Server running on http://localhost:3001"));