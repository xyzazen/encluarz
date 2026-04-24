// ============================================================
//  encluarz — Loadstring Generator (GitHub-backed)
// ============================================================

window.EncluarzLoadstring = {

  async generate(code, stats) {
    const lsLoading  = document.getElementById('lsLoading');
    const lsResult   = document.getElementById('lsResult');
    const lsError    = document.getElementById('lsError');
    const lsCode     = document.getElementById('lsCode');
    const lsCopy     = document.getElementById('lsCopy');
    const lsErrorMsg = document.getElementById('lsErrorMsg');
    const lsDbInfo   = document.getElementById('lsDbInfo');

    // reset UI
    lsLoading.style.display = 'flex';
    lsResult.style.display  = 'none';
    lsError.style.display   = 'none';

    try {
      // Upload ke GitHub
      const { id, rawUrl, entry } = await window.EncluarzGitHub.upload(code, stats);

      const loadstring = `loadstring(game:HttpGet("${rawUrl}"))()`;

      lsCode.textContent = loadstring;

      // Info DB
      if (lsDbInfo) {
        lsDbInfo.textContent = `ID: ${id}  ·  ${entry.stats.obfuscatedSize ? (entry.stats.obfuscatedSize / 1024).toFixed(1) + ' KB' : '?'}  ·  ${entry.timestamp.slice(0,10)}`;
      }

      // Copy button
      lsCopy.onclick = () => {
        navigator.clipboard.writeText(loadstring).then(() => {
          lsCopy.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
          setTimeout(() => {
            lsCopy.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
          }, 2000);
        });
      };

      lsLoading.style.display = 'none';
      lsResult.style.display  = 'block';

    } catch (err) {
      console.warn('GitHub upload failed:', err);
      lsLoading.style.display = 'none';
      lsErrorMsg.textContent  = err.message || 'Upload gagal. Cek token GitHub di config.js';
      lsError.style.display   = 'flex';
    }
  }
};
