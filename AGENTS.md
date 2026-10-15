<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Local setup and generated files

- The user starts the app server manually. Do not start, restart, or leave `next dev` / `next start` running unless explicitly requested. Ask before running browser suites that start an app server; never stop the user's server to free a test port without permission.
- This is a local-only app; GitHub stores the code, not a deployment. Keep fonts and Monaco local; AI is deferred. UI and exercise copy are Spanish.
- Run commands from the repository root. On Windows PowerShell use `npm.cmd` / `npx.cmd` if the `.ps1` wrappers are blocked.
- First setup: `npm ci` → `npm run setup`. Setup creates missing secrets, copies Monaco assets, starts the private PostgreSQL cluster, generates Prisma, deploys migrations, then seeds. Installing dependencies alone does not prepare the editor or database.
- Subsequent starts: `npm run db:start` → `npm run dev`. Use `http://127.0.0.1:3000`; auth and execution origin checks explicitly allow port 3000, so Next's automatic fallback port is not equivalent. Diagnose services with `npm run doctor`.
- PostgreSQL lives in `.local/postgres` on port **5434**, independently of existing Windows services. `PG_BIN` selects binaries and must match the cluster's major version. `db:stop` targets this private cluster, even with a custom `DATABASE_URL`.
- The executor is Piston via `compose.yaml` on **2000**. It needs Docker Desktop with WSL2 and **cgroup v2**; `wsl --install --no-distribution` is enough, no Linux distro is required. The first `wsl --install` can leave `VirtualMachinePlatform` disabled, which makes `wsl --status` claim virtualization is off — verify with `Get-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform` before blaming the firmware.
- The `docker` CLI is frequently missing from the PATH of a long-lived agent session even when Docker Desktop is installed; use `C:\Program Files\Docker\Docker\resources\bin\docker.exe`. `npm run doctor` already falls back to that path.
- Prisma 7 reads the URL from `prisma.config.ts` and uses the `pg` adapter. Generate with `npx prisma generate`; imports come from `src/generated/prisma/client`, not `@prisma/client`. `db:migrate` runs **migrate deploy**, not migration creation. Build regenerates Prisma but does not migrate or seed.
- Do not edit or commit `src/generated/`, `public/monaco/`, `.next/`, `.local/`, or real `.env` files. Rerun setup after updating Monaco to refresh its served assets.

## Verification traps

- Checks: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`. No formatter or CI workflow is configured; do not guess a `format` script.
- Focused unit suite: `npx tsx --test tests/judge.test.ts`. `npm test` also executes fixed repository reference solutions; Python must be installed (`PYTHON_BIN` overrides `python`). This is not permission to execute submitted user code outside the sandbox.
- E2E: prepare/seed PostgreSQL, run `npx playwright install chromium`, then `npm run test:e2e` with ports **3000 and 2001 free**. Playwright starts its own app and refuses to reuse an existing server.
- Two E2E suites exist and must not be confused. `npm run test:e2e` (`tests/e2e`) points `PISTON_URL` at the HTTP double on 2001 and never executes code. `npm run test:e2e:real` (`tests/real`, `playwright.real.config.ts`) uses Piston on 2000 for real; it skips itself when the executor is offline. Both create and delete temporary users and editorial content.
- `npm run test:runner` exercises the real Piston adapter and is skipped when the executor is down. Its file is `tests/real-runner.integration.ts` on purpose: it imports `server-only` through `piston.ts`, so it must run with `tsx --conditions=react-server` and must stay out of the `tests/*.test.ts` glob used by `npm test`.
- `tests/e2e/flows.spec.ts` is a **stateful serial sequence**: later tests depend on the account and cookies created earlier. Run the whole file, not an arbitrary later test with `-g`. It writes temporary data to the configured database and cleans it up; screenshots go to `.local/screenshots/`.
- E2E uses an HTTP Piston double on **2001** which never executes code. Passing E2E does not verify real isolation. Normal Piston uses **2000**; start it with `docker compose up -d` then `npm run runner:setup`. See `docs/verification.md` for verification limits.

## Domain invariants

- Execution flow: `POST /api/executions` reserves an idempotent submission under a short PostgreSQL advisory lock, returns 202, and schedules evaluation using Next `after()`. The client polls `/api/executions/[id]`. There is no durable job worker; interrupted attempts expire after two minutes when endpoints reconcile them.
- All submitted programs go through `src/server/execution/piston.ts`. Exercises implement `solve(data)` returning JSON. `judge.ts` compares the final JSON output outside the sandbox and strips hidden inputs, expected/actual outputs and stderr before results are persisted or returned.
- Only completed `submit` evaluations update progress, keyed by user + exercise + language. Example runs, solution views and infrastructure errors must not award completion. Preserve atomic finalization to avoid double-counting retries.
- Public catalog queries select the highest-numbered **published** version of a published exercise. Admin saves create new draft versions; publication validates both reference solutions in Piston. Preserve old variants for historical submissions.
- `prisma/content.ts` is the initial editorial catalog. The seed **skips existing slugs and paths**: changing this file and reseeding will not update an existing database. Use a new editorial version or an explicit data migration instead of resetting user data.
- Draft saves use revision-based optimistic concurrency; do not replace them with unconditional upserts. The workspace also keeps browser-local copies and a separate guest-to-account transfer.
- Better Auth recovery writes links to `.local/mail/`, not SMTP. Promote an existing account with `npm run admin -- email@example.com`; admin actions call `requireAdmin()` and must keep doing so.

## Design integration

- `src/app/globals.css` owns the light/dark tokens consumed by Tailwind, shadcn/ui and Monaco. Preserve the monochrome palette, blue primary actions and success-only green.
- Monaco requires six-digit hex values even when CSS optimization shortens tokens to `#fff`. Keep the normalization and root-class observer in `src/components/practice/code-editor.tsx`: `next-themes` can update the DOM after React effects, otherwise the editor retains the wrong theme.

## Git and GitHub workflow

- Standing user preference: once a feature or change is complete and verified, commit and push the task's changes to GitHub. A later instruction to hold publication takes precedence. Do not publish incomplete work as finished; report blockers or failed checks.
- Inspect `git status`, the diff, branch/upstream and remote before staging. Fetch before pushing; if the remote diverges, resolve deliberately without discarding local or remote work. Never force-push, rewrite published commits, or rename shared branches without explicit approval of that operation.
- Stage explicit task-related paths. Preserve unrelated user changes and untracked tooling. Never commit secrets, real environment files, generated assets, local databases, screenshots, test artifacts or dependency directories.
- Keep commits cohesive and independently understandable. Use Conventional Commit titles: `feat(ui): refine workspace and surface hierarchy`, `fix(tests): stabilize editorial snapshot ordering`, `docs(workflow): document publishing conventions`. Match the existing English commit style; avoid vague titles such as `update`, `changes` or `final`.
- Include a commit body explaining what changed, why, relevant verification and known limitations. Split independent fixes/documentation when useful, but do not split tightly coupled code into broken intermediate commits.
- Run the checks appropriate to the change and review `git diff --cached --check` and the staged diff before committing. Reuse current successful checks when the tested code has not changed; distinguish HTTP-double E2E coverage from real Piston execution. Respect the manual-server rule above.
- Use descriptive branch names when a branch is needed (`feat/<topic>`, `fix/<topic>`, `docs/<topic>`). Respect the existing repository workflow and branch protections. When using a pull request, give it a clear title and a description with Summary, Verification and Limitations; do not invent issue references or test results.
- After pushing, verify the remote branch points to the intended commit. Report commit hashes, the GitHub link, checks and any remaining local changes. A commit alone is not a completed upload.
