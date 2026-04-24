// ============================================================
//  encluarz — Config
//  Token TIDAK disimpan di sini — aman di Vercel env variable
//  Yang perlu diisi hanya endpoint API-nya
// ============================================================

window.ENCLUARZ_CONFIG = {
  // Endpoint Vercel serverless function
  // Kalau sudah deploy, otomatis jadi: https://namadomain.vercel.app/api/upload
  API_UPLOAD: '/api/upload',

  // Info publik (tidak sensitif)
  GITHUB_OWNER: 'xyzazen',
  GITHUB_REPO:  'encluarz-db',
  GITHUB_BRANCH: 'main',
};