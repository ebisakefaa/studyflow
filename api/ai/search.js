import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { query, userId } = req.body
  if (!query || !userId) return res.status(400).json({ error: 'Missing query or userId' })

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2)
    if (keywords.length === 0) return res.json({ results: [] })

    const conditions = keywords.map(k => 'extracted_text.ilike.%' + k + '%').join(',')
    const { data: docs, error } = await supabase
      .from('documents')
      .select('id, name, course_id, extracted_text, uploaded_at')
      .eq('user_id', userId)
      .or(conditions)
      .limit(20)

    if (error) return res.status(500).json({ error: error.message })

    const results = (docs || []).map(doc => {
      const text = doc.extracted_text || ''
      const lowerText = text.toLowerCase()
      const matches = []
      for (const keyword of keywords) {
        const idx = lowerText.indexOf(keyword)
        if (idx !== -1) {
          const start = Math.max(0, idx - 60)
          const end = Math.min(text.length, idx + keyword.length + 60)
          let snippet = text.slice(start, end).replace(/\s+/g, ' ').trim()
          if (start > 0) snippet = '...' + snippet
          if (end < text.length) snippet = snippet + '...'
          matches.push(snippet)
        }
      }
      return {
        id: doc.id,
        name: doc.name,
        course_id: doc.course_id,
        snippets: matches.slice(0, 3)
      }
    })

    res.json({ results })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}