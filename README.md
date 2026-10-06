# CampusGroups OIDC SPA

A dependency-free single-page app that signs users in with CampusGroups (OpenID Connect, authorization code flow + PKCE, public client) and shows their full name.

## Registration

Ask CampusGroups for a `client_id` with:

| Setting | Value |
|---|---|
| Redirect URI | `https://localhost:8444/` |
| Post-logout redirect URI | `https://localhost:8444/signed-out.html` |
| Scopes | `openid profile` |

## Setup

Requires Node.js 20.11+ (local server only), [mkcert](https://github.com/FiloSottile/mkcert) and a current browser.

```sh
cp config.example.js config.js   # then fill in issuer and clientId
mkcert -install                  # once per machine
mkcert -key-file key.pem -cert-file cert.pem localhost
node server.mjs                  # https://localhost:8444/
```

To use another port, set `PORT` and use it in `config.js` and the registered URIs.

`config.js`, `key.pem` and `cert.pem` are gitignored.

## Files

| File | Purpose |
|---|---|
| `index.html` | Page shell. |
| `app.js` | Sign-in and sign-out logic. |
| `signed-out.html` | Landing page after sign-out. |
| `config.example.js` | Template for `config.js`. |
| `server.mjs` | HTTPS static server for local development. |
