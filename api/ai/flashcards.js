const MODEL = 'tencent/hy3:free'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { text } = req.body
  if (!text) return res.status(400).json({ error: 'No text provided' })

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.OPENROUTER_API_KEY,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.SITE_URL || 'http://localhost:5173',
        'X-Title': 'StudyFlow'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: 'You are a helpful study assistant. Generate flashcards from the given study material. Return ONLY a valid JSON array of objects with "front" and "back" keys. The front is the question or term, the back is the answer or definition. Generate 10-15 flashcards. No other text, just the JSON array.' },
          { role: 'user', content: text }
        ]
      })
    })

    const data = await response.json()
    if (data.error) return res.status(500).json({ error: data.error.message })
    const content = data.choices[0].message.content
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return res.status(500).json({ error: 'Failed to parse flashcards' })
    res.json({ flashcards: JSON.parse(jsonMatch[0]) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}