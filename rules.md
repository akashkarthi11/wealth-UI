# Wealth UI: rules

Read this before changing code, config or deploys in this repo. It applies to every assistant and developer.

## Shared rules (all new Wealth projects)

Projects: `wealth-ui` (Next.js on Vercel), `wealth-bff` and `wealth-bss` (Spring Boot), `wealth-common` (shared library).
Plan and design: `wealth/docs/plans/2026-11-25-springboot-migration-plan.md` and `2026-11-25-wealth-migration-design.md`.
The old Node app in `wealth/` has its own `rules.md` (ledger, balances, interest). These rules do not change it.

### 1. The chain
- Browser → wealth-ui server → BFF → BSS → Neon Postgres and Redis. No step is skipped.
- Only wealth-ui talks to the BFF. Only the BFF talks to the BSS. Only the BSS talks to the database and Redis.
- The BSS address lives only in the BFF setting `WEALTH_BSS_BASE_URL`. It is never set in Vercel or the browser.
- The BSS runs in Docker on `140.245.200.17`, port 8081, bound to that server only. Its public address is the Cloudflare tunnel `https://speeds-unto-portland-experienced.trycloudflare.com`, which is `140.245.200.17:8081`. The BFF uses that address (`WEALTH_BSS_BASE_URL`). Never use `localhost:18081` on the BFF server: that old local BSS is stopped and disabled.
- A quick tunnel gets a new address when it restarts. If it changes, update `WEALTH_BSS_BASE_URL` in `/etc/wealth/bff.env`, update this rule, and restart the BFF (with approval).
- The BFF address lives only in the server-side Vercel variable `WEALTH_BFF_URL`. The browser never sees it or the JWT.

### 2. Never invent
- No table, column, API, validation, status value or business rule that is not in `docs/` or the code. If it is missing, ask.
- Check that a class, route or table does not already exist before adding one.
- Do not add dependencies, packages or configuration properties without being asked.

### 3. Secrets and personal data
- Never print, log, commit or paste keys, passwords, tokens, database URLs, `.env` files, private keys or customer data.
- List server settings by name only, from one named file. Never run `cat`, `sed` or a glob over `/etc/wealth/*` (it holds the JWT private key).
- Mask email addresses in logs.
- Never commit `application-prod.properties` with real values. Production values come from environment variables.

### 4. Approval before anything that changes something live
Ask first, every time, for: a push to GitHub, a deploy, a restart or stop of a service, a change to a server setting or Vercel variable,
a database change, a dependency change, and removing anything. A deploy approved once is not approval for the next one.

### 5. Branches, GitHub and deploys
- GitHub is not reachable from this laptop. Push only through the relay. From the repo root run
  `REPO=akashkarthi11/<repo> bash /c/karthi/UAB/wealth/scripts/relay-push-repo.sh development "<message>"` (add `dry` to list files first).
  The repo must be on the relay's allowed list (`GITHUB_RELAY_REPOS`); a 403 means it is not.
- Work and push on `development`. Never push `main` unless asked in that message.
- A push to `development` of `wealth-bff` or `wealth-bss` starts a deploy to Oracle. Say so before pushing.
- Commit first (the relay sends committed work only). Do not commit generated or foreign files.
- When the owner says "push": check wealth-bff, wealth-bss and wealth-common for commits newer than `refs/relay/development`, push only those through the relay, then check the live health of every service that deploys from them (the BFF and BSS deploy through their own CI). wealth-ui is not pushed to GitHub for now: the assistant only deploys it to Vercel after changes (commit locally first).
- The relay is the Vercel project `karthi-github-relay`. Nothing relay-related runs on the Oracle servers.

### 6. Code style (from the design doc)
- Layers follow GrowX. BFF: `contract → controller → validator → Feign client`. BSS: `contract → controller → service interface → service impl → DAO interface → DaoImple → query constants`.
- One `WealthFeignClient` in the BFF and one constants file per project. No inline SQL. Entities extend `GenericEntity`.
- APIs are `POST`, lowercase hyphenated URLs, `ApiResponse` envelope, `KarthiException` with an error code. Health checks are the one `GET` exception.
- Logging with `KarthiLogger`, no `{}` placeholders. Comments at most 2 lines, short and factual. No wildcard imports.
- No new packages, helper, mapper or factory classes unless asked.

### 7. Prove it, then say so
- Run the tests and report the totals before claiming something works. Never write "passed" without the output.
- After a deploy, check the live result (health URL or the changed route) and report what it returned.
- Report the commit hash and the branch for every commit and push.
- Say what was not checked.

### 8. Data safety
- No test touches the production database or Redis. Use a Neon branch or a test container.
- Schema changes go only through the existing migrations in `wealth/scripts/migrations` until the plan says otherwise. The BSS never runs DDL.
- Every table has the GrowX audit columns (`crtd_dt`, `crtd_by`, `updt_dt`, `updt_by`; migration 0054). A new table's migration ends with `SELECT wealth_add_audit('table');`, and `scripts/db/check-audit-columns.sql` must return 0 rows. System and cron writes are user 1.

### 9. Build and run (this laptop)
- Java: `JAVA_HOME` is Zulu 21. There is no `mvn` on PATH. Use the cached Maven under `~/.m2/wrapper/dists/apache-maven-3.9.11/*/bin/mvn`, offline (`-o`).
- Node is not installed. Run Node tools through Docker (`node:20-alpine`). With Git Bash set `MSYS_NO_PATHCONV=1`.
- Vercel deploy: `docker run ... node:20-alpine npx vercel@latest deploy --prod --yes`, with auth mounted from `C:/Users/THINKPAD/vercel-auth`.
- `curl` to some HTTPS hosts needs `--ssl-no-revoke` on this laptop.

## wealth-ui rules
- This is Next.js 16, not the version you may know. Read the matching guide in `node_modules/next/dist/docs/` before writing code (see `AGENTS.md`).
- Only server code (route handlers) calls the BFF, through `src/lib/bff.ts`. A screen calls our own same-origin `/api/...` routes, never the BFF or BSS address.
- Backend addresses are server-only variables (`WEALTH_BFF_URL`). Never use `NEXT_PUBLIC_` for a backend address, and never add a BSS address here.
- The JWT lives in the httpOnly, Secure, SameSite=Lax cookie. Return only the user to the browser, never the token.
- The pass-through `/api/bff/<module>/<action>` must keep refusing login, register and any `..` path.
- Mobile first. Check phone width and landscape before calling a screen done.
- Vercel project `wealth-ui` (production at wealth-ui-ten.vercel.app). Type-check with `tsc --noEmit --incremental false` in the Docker container before deploying.

## wealth-ui coding plan (how every screen is built)

**Data flow, one way:** screen → one shared API client → our `/api/...` route → `bffPost` → BFF. The screen renders only what the API returns. No hardcoded, sample or copied data in a screen once its API exists.

1. **A screen loads its own data from the API.** The page calls the API on open, shows a loading state, then the returned data, or an error state. It does not rely on props copied from another screen.
2. **One API client, one data hook.** All browser calls go through `src/lib/api.ts` (one function that posts to `/api/bff/<module>/<action>`, parses the `ApiResponse` envelope and maps error codes with `messageFor`). Screens read data through one hook (for example `useApi`) that returns `{ data, loading, error, reload }`. Create each once, when the first screen needs it. No raw `fetch()` inside a screen or component.
3. **One base URL, built dynamically from constants.**
   - Server: the BFF base is read once, from `WEALTH_BFF_URL`, in `src/lib/bff.ts`. The BFF API prefix (`/wealth/api/v1/`) is one constant there.
   - Browser: the only base is the same-origin `/api/bff`, one constant in `src/lib/constants.ts`.
   - Endpoints (`customers/users/login`, `customers/users/me`, `health`, and so on) are named constants in `src/lib/constants.ts`, grouped by module.
   - A screen calls `api(ENDPOINTS.<module>.<action>, body)`. The client builds the URL from the base and the constant. A screen never writes a URL, a path segment, `http://`, `/api/` or `/wealth/` as a string.
   - A different environment changes the one environment variable, not a screen. A changed endpoint is edited in one constant.
   - Also in `src/lib/constants.ts`: timeouts, storage and cookie names, and fixed limits (for example password length 10 to 200). Never repeat a literal.
4. **One place for each other thing.** Types of API data live in `src/lib/types.ts` and mirror the BFF DTOs. Error messages live in `src/lib/errors.ts`. Formatting (money, dates, percent) lives in one `src/lib/format.ts`. A screen never redefines them.
5. **Shared components, searched first.** Before writing a UI element, search `src/components/` and the existing screens. Build the element once there (status dot, card, loading, empty and error states, buttons, form field) and import it. The same markup or logic in two places is a defect.
6. **Thin pages.** A `page.tsx` only composes: call the hook, pick the state, render shared components. Logic that a second screen could need moves to `src/lib/` first.
7. **Server routes follow the same rule.** New `/api/...` handlers reuse `bffPost`, `getToken`, `clientIp` and the error mapping. A pass-through route already exists for module calls; add a dedicated handler only when it must set a cookie or reshape the data.
8. **Every screen has four states:** loading, data, empty and error. The error shows the mapped message and a retry. Never show raw errors, tokens or addresses.
9. **No duplicate code is allowed.** Copy and paste is the red flag. On the second use, move the code to the shared place and change both callers in the same commit. A change that adds a second copy is not finished.
10. **Styling from tokens.** Colors, spacing and type come from `src/app/tokens.css`; no literal colors in a component. Mobile first, then check phone landscape and desktop.
11. **Done means:** type-check passes, the screen works against the local BFF and BSS, the loading, empty and error states were each seen, and a search shows no repeated block.

**Applied to login (2026-11-26):** `src/lib/constants.ts` and `src/lib/api.ts` exist, and login, logout, overview and the health route use them. Shared pieces: `src/components/Field`, `HealthCheck` and `icons`. The home address `/` redirects to `/login`, which carries the System status panel (Check health button).
