export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { text } = req.body
    if (!text) return res.status(400).json({ error: 'No text provided' })
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + process.env.OPENROUTER_API_KEY, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://studyflow-three-green.vercel.app', 'X-Title': 'StudyFlow' },
      body: JSON.stringify({ model: 'tencent/hy3:free', messages: [{ role: 'system', content: 'You are a helpful study assistant. Provide a clear, well-organized summary of the given study material. Use bullet points and headings. Keep it concise but thorough.' }, { role: 'user', content: 'Summarize this study material:\n\n' + text }] })
    })
    const data = await response.json()
    if (data.error) return res.status(500).json({ error: data.error.message })
    res.status(200).json({ summary: data.choices[0].message.content })
  } catch (err) { res.status(500).json({ error: err.message }) }
}