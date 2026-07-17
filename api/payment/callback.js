export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).json({ received: true })

  try {
    const body = await req.json()
    console.log('Chapa callback:', body)
    res.status(200).json({ received: true })
  } catch (err) {
    res.status(200).json({ received: true })
  }
}