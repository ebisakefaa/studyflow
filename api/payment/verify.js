export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { tx_ref } = req.body
  if (!tx_ref) return res.status(400).json({ error: 'Missing transaction reference' })

  try {
    const response = await fetch('https://api.chapa.co/v1/transaction/verify/' + tx_ref, {
      headers: {
        'Authorization': 'Bearer ' + process.env.CHAPA_SECRET_KEY
      }
    })

    const data = await response.json()
    if (data.status !== 'success') return res.status(500).json({ error: data.message || 'Verification failed' })
    res.json({ status: data.data.status, plan: data.data.metadata?.plan || 'monthly' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}