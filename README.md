# wealth-ui

Starter scaffold — Next.js 14 (App Router, TypeScript). Not real product UI yet.

## Local dev

```
npm install
npm run dev
```

Set `NEXT_PUBLIC_WEALTH_BFF_URL` (e.g. `http://localhost:8080`) to point the home
page's connectivity check at a running `wealth-bff` instance.

## Login (2026-11-25)

- `/login` signs in through `POST /api/auth/login`; the Next.js server calls the BFF, keeps the JWT in the httpOnly `wealth_token` cookie and returns only the user.
- `/overview` is a placeholder landing page that needs the session; `POST /api/auth/logout` and `GET /api/auth/me` complete the set.
- `POST /api/bff/<module>/<action>` forwards one JSON call to the BFF with the Bearer token (login and register are not reachable through it).
- Set `WEALTH_BFF_URL` (server only, for example `http://localhost:8080`). The browser never sees it.
