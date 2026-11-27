# MYM · Applied AI consulting

A bilingual portfolio and consultation workspace for Mohammad Yadollah Moghaddam. The site introduces Darj and Sepam, two systems designed for Bank Maskan, and an independent U.S. research initiative in development. English is the default. Every public page has a Persian counterpart under `/fa/`.

[Visit the English site](https://mym-studio.vercel.app/) · [مشاهدهٔ سایت فارسی](https://mym-studio.vercel.app/fa/)

## Run locally

Use Node.js 22 or newer and npm. Initialize the public research submodule after cloning.

```sh
git submodule update --init
npm ci
npm test
npm run build
python3 -m http.server 8000 --directory dist
```

Open localhost on port 8000. Without Supabase settings the site provides an explicitly labeled, in-memory client and administrator preview. Example conversations reset on navigation. Portfolio pages, images, typography and navigation are fully local. Development credentials and preview sessions never need to be committed.

## Connect the site to production

1. Create or select a dedicated Supabase project in the intended organization. Use the actual project URL and API keys shown in its dashboard. An organization or dashboard URL cannot serve as the API endpoint. Apply `supabase/migrations/202611210001_mym_workspace.sql` once using the Supabase migration workflow or SQL editor. It creates MYM’s private schema and a limited set of public RPCs.
2. Enable the Email provider and email confirmations. Use a configured SMTP sender for real client addresses. Keep the default confirmation URL in magic-link templates, or an equivalent PKCE-compatible template. Email links must be opened in the same browser that requested them. Enable Google in Authentication → Sign In / Providers, configure the Google OAuth web application with Supabase’s displayed callback URI, and enter the Google client credentials **in Supabase**. Only the email address and basic profile scopes are needed.
3. Push this project to a repository in the intended GitHub account, with `main` as the production branch. In the intended Vercel team, import that repository. Vercel reads `vercel.json`, runs `npm run build`, serves `dist/` and deploys `api/visit.js` as a function. Use Node 22.x or newer. Connect the production branch for automatic deployment after pushes. GitHub Actions runs the build and database access tests on pushes and pull requests.
4. Configure the following environment variables on Vercel. Mark the analytics token sensitive. The service-role key is unnecessary. Redeploy after changing build-time settings.

| Variable                   | Value                                                                                                                   |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `SITE_URL`                 | Canonical HTTPS visitor origin. For initial publication use the actual assigned Vercel domain.                          |
| `SUPABASE_URL`             | Project API origin, normally `https://<project-ref>.supabase.co`.                                                       |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key or legacy anon key. The build includes this in the public configuration.                       |
| `MYM_ANALYTICS_TOKEN`      | A random 64-character hex token for the page-view collector only. Store only its SHA-256 digest in mym_private.collector. |

5. In Supabase Authentication → URL Configuration, set Site URL to the production visitor origin. Allow that origin with the paths `/portal/`, `/admin/`, `/fa/portal/` and `/fa/admin/`. Also allow the consultation-entry URL with `?new=1` on both portal paths if the provider configuration matches queries exactly. Use an isolated database for test deployments.
6. Designate the intended administrator from a trusted database operator session. The script binds an existing verified identity or records a one-time pending appointment that is consumed when the designated address is verified. Access follows the account UUID. Configure connection details securely in your PostgreSQL client. With an authenticated `psql` connection and the intended address in the local `MYM_ADMIN_EMAIL` variable, run the following command.

```sh
psql -v owner_email="$MYM_ADMIN_EMAIL" -f scripts/designate-admin.sql
```

The designated owner signs in at `/admin/` using the verified address. No administrator email, default password or production secret is embedded in the repository. A client can never appoint an administrator. For a custom Supabase API hostname, add the exact HTTPS origin to the CSP `connect-src` in `vercel.json` before deploying.

## Consultation assistant

The server calls Groq directly using `openai/gpt-oss-120b`. Create a key in a Groq Free organization and save it as the sensitive **Production** environment variable `GROQ_API_KEY` in Vercel. Redeploy after changing the key. The site uses a labeled local guide and the existing private referral form when the key is missing or the free quota is exhausted.

## Client and admin operations

- Clients start requests, read their own history and send follow-up messages. Closing a request stops further replies until the administrator reopens it.
- Administrators search and filter the queue, respond inside the portal, set status and inspect account, consultation and traffic statistics.
- Traffic is counted on public pages in the production site with the collector configured. Totals are aggregate browser-reported page views by day, page and language. Counts can include repeated visits or automated traffic and omit blocked requests. Operational logs are managed separately by each provider.
- The database enforces identity and ownership for every operation. Private tables have row-level security enabled and no direct client grants. Mutations use typed inputs, atomic transactions, idempotent client identifiers and per-account rate limits. The client renders messages as escaped text.
- `npm test` runs the migration on embedded PostgreSQL, verifies separate client/administrator access, transactional retries and analytics permissions, and checks bilingual metadata. Live provider acceptance requires a real email/Google sign-in, creating a request, a reply from a separately signed-in administrator and verification of the reply from the client account.

## Site content and domain changes

- The [Installment Repayment Review repository](https://github.com/mym1359/installment-repayment-review) owns the demo, case-study copy, and tests. The site pins a revision in `projects/installment-repayment-review`. To publish a new revision, advance that Git submodule commit and rerun the site tests and build.
- Edit `src/content.mjs` for the bilingual portfolio copy and `src/workspace-copy.mjs` for portal text.
- The supplied MYM mark, navy/teal/orange palette, local Poppins and Vazirmatn fonts, and brand tagline guide the design. Project artwork is illustrative. No internal bank screenshots or records are included.
- Public pages are generated as HTML. Each locale has its own titles, descriptions, reciprocal language links, social metadata and sitemap entries. Account pages are marked noindex. The Supabase SDK loads only when a real account workspace is configured.
- To move to a personal domain, add and verify it in the same Vercel project, update `SITE_URL`, change Supabase’s permitted redirects and Site URL, and redeploy. Preserve the same Supabase project to retain accounts and conversations. Once the new domain works, redirect the former production hostname to it.
- `.openai/hosting.json` identifies the owner’s private review site. Vercel does not use this manifest.

Provider references: [Supabase email login](https://supabase.com/docs/guides/auth/auth-email-passwordless), [Google login](https://supabase.com/docs/guides/auth/social-login/auth-google), [Supabase SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [Vercel Git deployments](https://vercel.com/docs/deployments) and [custom domains](https://vercel.com/docs/domains/working-with-domains).
