export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { tx_ref } = req.body
    if (!tx_ref) return res.status(400).json({ error: 'Missing transaction reference' })

    const CHAPA_SECRET = process.env.CHAPA_SECRET_KEY

    const response = await fetch('https://api.chapa.co/v1/transaction/verify/' + tx_ref, {
      headers: { 'Authorization': 'Bearer ' + CHAPA_SECRET }
    })

    const data = await response.json()
    if (data.error) return res.status(500).json({ error: data.message })

    if (data.data.status === 'success') {
      const plan = tx_ref.split('_')[0]
      res.status(200).json({ status: 'success', plan: plan })
    } else {
      res.status(200).json({ status: 'failed' })
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}