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

async function handleCallback(oidc) {
  const pending = JSON.parse(sessionStorage.getItem('pending'));
  sessionStorage.removeItem('pending');
  history.replaceState(null, '', location.pathname);
  if (params.get('state') !== pending?.state) throw new Error('state mismatch');
  if (params.has('error')) throw new Error(params.get('error'));
  if (params.get('iss') !== oidc.issuer) throw new Error('issuer mismatch');

  const res = await fetch(oidc.token_endpoint, {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: params.get('code'),
      redirect_uri: config.redirectUri,
      client_id: config.clientId,
      code_verifier: pending.verifier,
    }),
  });
  if (!res.ok) throw new Error(`token request failed: ${res.status}`);
  const { id_token: idToken } = await res.json();
  app.textContent = 'Tokens received.';
}

try {
  const oidc = await getJson(`${config.issuer}/.well-known/openid-configuration`);
  if (params.has('code') || params.has('error')) await handleCallback(oidc);
  else await signIn(oidc);
} catch (err) {
  app.textContent = `Sign-in failed: ${err.message}`;
}
