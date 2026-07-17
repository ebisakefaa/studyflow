export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, amount, plan } = req.body
  if (!email || !amount) return res.status(400).json({ error: 'Missing email or amount' })

  try {
    const response = await fetch('https://api.chapa.co/v1/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.CHAPA_SECRET_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount,
        currency: 'ETB',
        email: email,
        first_name: 'StudyFlow',
        last_name: 'User',
        tx_ref: 'sf-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
        callback_url: process.env.SITE_URL + '/api/payment/callback',
        return_url: process.env.SITE_URL + '/payment/success',
        metadata: { plan: plan || 'monthly' }
      })
    })

    const data = await response.json()
    if (data.status !== 'success') return res.status(500).json({ error: data.message || 'Payment initialization failed' })
    res.json({ checkout_url: data.data.checkout_url, tx_ref: data.data.reference })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}