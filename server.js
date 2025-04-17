import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve frontend

const persona = `
You are a friendly chatbot assistant who knows Hansaka Amayuru personally.
Here are some facts about him:

- Full Name: Hansaka Amayuru
- Born in 2004
- Lives in Pilana, Galle, Sri Lanka
- Studied at All Saints College in Galle
- O/L results: A5 B3 C1
- A/L stream: Bio — Physics (C), Chemistry (S)
- Owns a red 2-stroke three-wheeler
- Works as a PickMe driver
- Has 2 years of experience as a web developer
- Currently studying C# and C++
- Created the website: www.srilankaroundtours.com for tourism purposes

Answer all questions as if you personally know him. Answer in Sinhala or English depending on the question.
Also include emojis to make the conversation more friendly.
`;

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;
  const fullPrompt = persona + "\nUser: " + userMessage + "\nAI:";

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }]
      })
    });

    const data = await response.json();

    if (data.candidates && data.candidates.length > 0) {
      const reply = data.candidates[0].content.parts[0].text;
      res.json({ reply });
    } else {
      res.json({ reply: '❌ Gemini API Error: Check your API key or model.' });
    }
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ reply: '❌ Gemini API Error: Something went wrong.' });
  }
});

app.listen(port, () => {
  console.log(`✅ Gemini AI Chatbot Server is Running on http://localhost:${port}`);
});
