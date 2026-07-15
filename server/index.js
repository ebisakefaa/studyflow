import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env') })

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY
const MODEL = 'tencent/hy3:free'

app.post('/api/ai/summarize', async (req, res) => {
  try {
    const { text } = req.body
    if (!text) return res.status(400).json({ error: 'No text provided' })
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + OPENROUTER_KEY, 'Content-Type': 'application/json', 'HTTP-Referer': 'http://localhost:5173', 'X-Title': 'StudyFlow' },
      body: JSON.stringify({ model: MODEL, messages: [{ role: 'system', content: 'You are a helpful study assistant. Provide a clear, well-organized summary of the given study material. Use bullet points and headings. Keep it concise but thorough.' }, { role: 'user', content: 'Summarize this study material:\n\n' + text }] })
    })
    const data = await response.json()
    if (data.error) return res.status(500).json({ error: data.error.message })
    res.json({ summary: data.choices[0].message.content })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/api/ai/flashcards', async (req, res) => {
  try {
    const { text } = req.body
    if (!text) return res.status(400).json({ error: 'No text provided' })
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + OPENROUTER_KEY, 'Content-Type': 'application/json', 'HTTP-Referer': 'http://localhost:5173', 'X-Title': 'StudyFlow' },
      body: JSON.stringify({ model: MODEL, messages: [{ role: 'system', content: 'You are a helpful study assistant. Generate flashcards from the given study material. Return ONLY a valid JSON array of objects with "front" and "back" keys. The front is the question or term, the back is the answer or definition. Generate 10-15 flashcards. No other text, just the JSON array.' }, { role: 'user', content: text }] })
    })
    const data = await response.json()
    if (data.error) return res.status(500).json({ error: data.error.message })
    const content = data.choices[0].message.content
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return res.status(500).json({ error: 'Failed to parse flashcards' })
    res.json({ flashcards: JSON.parse(jsonMatch[0]) })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/api/ai/quiz', async (req, res) => {
  try {
    const { text } = req.body
    if (!text) return res.status(400).json({ error: 'No text provided' })
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + OPENROUTER_KEY, 'Content-Type': 'application/json', 'HTTP-Referer': 'http://localhost:5173', 'X-Title': 'StudyFlow' },
      body: JSON.stringify({ model: MODEL, messages: [{ role: 'system', content: 'You are a helpful study assistant. Generate a multiple choice quiz from the given study material. Return ONLY a valid JSON array of objects with "question", "options" (array of 4 strings), and "correct" (the correct answer string) keys. Generate 8-12 questions. No other text, just the JSON array.' }, { role: 'user', content: text }] })
    })
    const data = await response.json()
    if (data.error) return res.status(500).json({ error: data.error.message })
    const content = data.choices[0].message.content
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return res.status(500).json({ error: 'Failed to parse quiz' })
    res.json({ quiz: JSON.parse(jsonMatch[0]) })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/api/ai/ask', async (req, res) => {
  try {
    const { text, question } = req.body
    if (!text || !question) return res.status(400).json({ error: 'Missing text or question' })
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + OPENROUTER_KEY, 'Content-Type': 'application/json', 'HTTP-Referer': 'http://localhost:5173', 'X-Title': 'StudyFlow' },
      body: JSON.stringify({ model: MODEL, messages: [{ role: 'system', content: 'You are a helpful study tutor. Answer the student question based ONLY on the provided study material. If the answer is not in the material, say so clearly. Be concise and clear.' }, { role: 'user', content: 'Study material:\n' + text + '\n\nQuestion: ' + question }] })
    })
    const data = await response.json()
    if (data.error) return res.status(500).json({ error: data.error.message })
    res.json({ answer: data.choices[0].message.content })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.listen(3001, () => { console.log('StudyFlow AI server running on http://localhost:3001') })