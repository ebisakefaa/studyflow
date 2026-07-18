export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { text, question } = req.body
    if (!text || !question) return res.status(400).json({ error: 'Missing text or question' })
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + process.env.OPENROUTER_API_KEY, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://studyflow-three-green.vercel.app', 'X-Title': 'StudyFlow' },
      body: JSON.stringify({ model: 'tencent/hy3:free', messages: [{ role: 'system', content: 'You are a helpful study tutor. Answer the student question based ONLY on the provided study material. If the answer is not in the material, say so clearly. Be concise and clear.' }, { role: 'user', content: 'Study material:\n' + text + '\n\nQuestion: ' + question }] })
    })
    const data = await response.json()
    if (data.error) return res.status(500).json({ error: data.error.message })
    res.status(200).json({ answer: data.choices[0].message.content })
  } catch (err) { res.status(500).json({ error: err.message }) }
}