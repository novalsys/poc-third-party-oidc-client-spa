import config from './config.js';

const app = document.getElementById('app');
const params = new URLSearchParams(location.search);

const b64url = (bytes) => new Uint8Array(bytes).toBase64({ alphabet: 'base64url', omitPadding: true });
const random = () => b64url(crypto.getRandomValues(new Uint8Array(32)));
const getJson = (url) => fetch(url).then((res) => (res.ok ? res.json() : Promise.reject(new Error(`${url}: ${res.status}`))));

async function signIn(oidc) {
  const pending = { state: random(), nonce: random(), verifier: random() };
  sessionStorage.setItem('pending', JSON.stringify(pending));
  const challenge = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pending.verifier));
  location.assign(`${oidc.authorization_endpoint}?${new URLSearchParams({
    client_id: config.clientId,
    response_type: 'code',
    redirect_uri: config.redirectUri,
    scope: 'openid profile',
    code_challenge: b64url(challenge),
    code_challenge_method: 'S256',
    state: pending.state,
    nonce: pending.nonce,
  })}`);
}

try {
  const oidc = await getJson(`${config.issuer}/.well-known/openid-configuration`);
  if (params.has('code') || params.has('error')) app.textContent = 'Returned from sign-in.';
  else await signIn(oidc);
} catch (err) {
  app.textContent = `Sign-in failed: ${err.message}`;
}
