export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { text } = req.body
    if (!text) return res.status(400).json({ error: 'No text provided' })
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + process.env.OPENROUTER_API_KEY, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://studyflow-three-green.vercel.app', 'X-Title': 'StudyFlow' },
      body: JSON.stringify({ model: 'tencent/hy3:free', messages: [{ role: 'system', content: 'You are a helpful study assistant. Generate a multiple choice quiz from the given study material. Return ONLY a valid JSON array of objects with "question", "options" (array of 4 strings), and "correct" (the correct answer string) keys. Generate 8-12 questions. No other text, just the JSON array.' }, { role: 'user', content: text }] })
    })
    const data = await response.json()
    if (data.error) return res.status(500).json({ error: data.error.message })
    const content = data.choices[0].message.content
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return res.status(500).json({ error: 'Failed to parse quiz' })
    res.status(200).json({ quiz: JSON.parse(jsonMatch[0]) })
  } catch (err) { res.status(500).json({ error: err.message }) }
}