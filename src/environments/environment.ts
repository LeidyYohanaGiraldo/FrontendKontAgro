export const environment = {
  production: false,
  apiUrl: 'https://api.kontagro.com/api',
  session: {
    idleTimeoutMs: 30 * 60 * 1000,
    warningBeforeMs: 2 * 60 * 1000,
    refreshBeforeExpiryMs: 5 * 60 * 1000
  }
};
