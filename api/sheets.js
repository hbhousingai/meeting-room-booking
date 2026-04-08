export default async function handler(req, res) {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) {
    return res.status(500).json({ error: 'APPS_SCRIPT_URL 環境變數尚未設定' });
  }

  const params = new URLSearchParams(req.query).toString();

  try {
    const response = await fetch(`${url}?${params}`, {
      redirect: 'follow',
      headers: { Accept: 'application/json' },
    });
    const text = await response.text();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).send(text);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
