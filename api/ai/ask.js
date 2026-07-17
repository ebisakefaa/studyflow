import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)
const MODEL = 'tencent/hy3:free'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { text, question } = req.body
  if (!text || !question) return res.status(400).json({ error: 'Missing text or question' })
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + process.env.OPENROUTER_API_KEY, 'Content-Type': 'application/json', 'HTTP-Referer': process.env.SITE_URL || 'http://localhost:5173', 'X-Title': 'StudyFlow' },
      body: JSON.stringify({ model: MODEL, messages: [
        { role: 'system', content: 'You are a helpful study tutor. Answer the student question based ONLY on the provided study material. If the answer is not in the material, say so clearly. Be concise and clear.' },
        { role: 'user', content: 'Study material:\n' + text + '\n\nQuestion: ' + question }
      ] })
    })
    const data = await response.json()
    if (data.error) return res.status(500).json({ error: data.error.message })
    res.json({ answer: data.choices[0].message.content })
  } catch (err) { res.status(500).json({ error: err.message }) }
}