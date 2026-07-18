export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { email, amount, plan } = req.body
    if (!email || !amount || !plan) return res.status(400).json({ error: 'Missing required fields' })

    const tx_ref = plan + '_' + Date.now()
    const CHAPA_SECRET = process.env.CHAPA_SECRET_KEY
    const SITE_URL = process.env.SITE_URL

    const response = await fetch('https://api.chapa.co/v1/transaction/initialize', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + CHAPA_SECRET, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amount,
        currency: 'ETB',
        email: email,
        first_name: 'StudyFlow',
        last_name: 'User',
        tx_ref: tx_ref,
        callback_url: SITE_URL + '/payment/success?trx_ref=' + tx_ref,
        return_url: SITE_URL + '/payment/success?trx_ref=' + tx_ref
      })
    })

    const data = await response.json()
    if (data.status === 'error' || !data.data) {
      return res.status(500).json({ error: 'Chapa Error: ' + JSON.stringify(data.message || data) })
    }
    
    res.status(200).json({ checkout_url: data.data.checkout_url, tx_ref: tx_ref })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}