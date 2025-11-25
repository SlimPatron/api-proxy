const express = require('express');
const app = express();
app.use(express.json());

// Import für node-fetch
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)); 

app.post('/generate-content', async (req, res) => {
  // Deinen geheimen Key aus den Vercel Environment Variables
  const apiKey = process.env.PERPLEXITY_API_KEY;
  const { prompt } = req.body;

  // Validierung (falls prompt fehlt)
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt fehlt' });
  }

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          { role: "system", content: "Antworte nur mit validem JSON." },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    // Fehlerbehandlung bei schlechtem API-Response
    if (!response.ok) {
      return res.status(500).json({ error: 'API request failed', details: data });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Server-Fehler', details: error.message });
  }
});

// Für Vercel:
module.exports = app;
