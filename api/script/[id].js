// ============================================================
//  encluarz — Script Proxy Endpoint
//  GET /api/script/:id  →  proxies .lua from GitHub
//  Loadstring pakai domain sendiri, bukan raw GitHub
// ============================================================

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id || !/^[a-z0-9]+$/i.test(id)) {
    return res.status(400).json({ error: 'Invalid script ID' });
  }

  const {
    GITHUB_OWNER,
    GITHUB_REPO,
    GITHUB_BRANCH = 'main',
    GITHUB_TOKEN,
  } = process.env;

  if (!GITHUB_OWNER || !GITHUB_REPO) {
    return res.status(500).json({ error: 'GitHub env variables belum diset di Vercel' });
  }

  const rawUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/scripts/${id}.lua`;

  try {
    const ghRes = await fetch(rawUrl, {
      headers: GITHUB_TOKEN
        ? { Authorization: `Bearer ${GITHUB_TOKEN}` }
        : {},
    });

    if (!ghRes.ok) {
      return res.status(ghRes.status).json({ error: 'Script not found' });
    }

    const code = await ghRes.text();

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.status(200).send(code);

  } catch (err) {
    console.error('[script proxy error]', err);
    return res.status(500).json({ error: err.message || 'Proxy error' });
  }
}
