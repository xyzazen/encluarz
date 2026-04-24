// ============================================================
//  encluarz — GitHub Database Handler
//  Kirim ke /api/upload (Vercel) — token aman di server
// ============================================================

window.EncluarzGitHub = (function () {

  function cfg() { return window.ENCLUARZ_CONFIG || {}; }

  // Buat ID unik
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  // Info client (tidak sensitif)
  function clientInfo() {
    return {
      ua: navigator.userAgent.slice(0, 120),
      lang: navigator.language,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ts: new Date().toISOString(),
    };
  }

  async function upload(obfuscatedCode, stats) {
    const c   = cfg();
    const id  = uid();
    const info = clientInfo();

    const dbEntry = {
      id,
      timestamp: info.ts,
      timezone:  info.tz,
      language:  info.lang,
      ua:        info.ua,
      stats: {
        originalSize:   stats ? stats.originalSize   : null,
        obfuscatedSize: stats ? stats.obfuscatedSize : null,
        ratio:          stats ? stats.ratio          : null,
        transforms:     stats ? stats.transformsApplied : [],
      },
      script_url: `https://raw.githubusercontent.com/${c.GITHUB_OWNER}/${c.GITHUB_REPO}/${c.GITHUB_BRANCH}/scripts/${id}.lua`,
    };

    // Kirim ke Vercel serverless function
    const res = await fetch(c.API_UPLOAD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        scriptContent: obfuscatedCode,
        dbEntry,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Server error ${res.status}`);
    }

    const data = await res.json();
    return { id, rawUrl: data.rawUrl, entry: dbEntry };
  }

  return { upload };
})();