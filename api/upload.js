// ============================================================
//  encluarz — Vercel Serverless Function
//  Token GitHub aman di environment variable Vercel
//  Set di: Vercel Dashboard → Settings → Environment Variables
//  Nama variable: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH
// ============================================================

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    GITHUB_TOKEN,
    GITHUB_OWNER,
    GITHUB_REPO,
    GITHUB_BRANCH = 'main',
  } = process.env;

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return res.status(500).json({ error: 'GitHub env variables belum diset di Vercel' });
  }

  const { id, scriptContent, dbEntry } = req.body;

  if (!id || !scriptContent || !dbEntry) {
    return res.status(400).json({ error: 'Body tidak lengkap' });
  }

  try {
    // Upload script .lua ke GitHub
    await githubPut(
      `scripts/${id}.lua`,
      scriptContent,
      `[encluarz] script ${id}`,
      { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH }
    );

    // Upload entry database .json ke GitHub
    await githubPut(
      `db/${id}.json`,
      JSON.stringify(dbEntry, null, 2),
      `[encluarz] db entry ${id}`,
      { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH }
    );

    // ─── Gunakan domain situs sendiri untuk loadstring ───
    // Otomatis sesuai domain deploy (Vercel, Netlify, dsb.)
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const siteUrl = `${proto}://${host}`;

    // URL endpoint proxy script (pakai domain sendiri)
    const scriptUrl = `${siteUrl}/api/script/${id}`;

    // Juga simpan raw GitHub URL sebagai backup
    const rawGithubUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/scripts/${id}.lua`;

    return res.status(200).json({
      success:      true,
      id,
      rawUrl:       scriptUrl,        // ← pakai site URL sendiri
      rawGithubUrl: rawGithubUrl,     // ← GitHub URL sebagai backup
    });

  } catch (err) {
    console.error('[encluarz upload error]', err);
    return res.status(500).json({ error: err.message || 'Upload gagal' });
  }
}

// ── Helper: push file ke GitHub API ──
async function githubPut(path, content, message, { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH }) {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;

  let sha;
  try {
    const check = await fetch(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
      },
    });
    if (check.ok) {
      const data = await check.json();
      sha = data.sha;
    }
  } catch (_) {}

  const body = {
    message,
    content: Buffer.from(content).toString('base64'),
    branch: GITHUB_BRANCH,
  };
  if (sha) body.sha = sha;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `GitHub API ${res.status}`);
  }

  return res.json();
}
