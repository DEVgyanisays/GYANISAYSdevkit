# Gyani Says — Node.js backend

The original compiled React/Vite frontend is preserved. Express replaces PHP, mysql2 replaces PDO, and Nodemailer replaces PHPMailer. No frontend rebuild is needed; frontend source was not included in this repository.

## Run

1. Install Node.js 24+ and run `npm ci` in this directory.
2. Copy `.env.example` to `.env`. Fill in the existing MySQL and SMTP credentials and choose a strong admin password. Node uses these admin credentials instead of the Apache htpasswd file.
3. Reuse the existing `prospects` table; no automatic database changes occur. For new installations only, import `database/schema.sql`. That schema was inferred from the PHP queries because the original DDL was not included.
4. Run `npm start`, then open `http://127.0.0.1:3000`. Use `npm run dev` for automatic restart and `npm test` for integration tests.

Keep the database timezone consistent with the previous deployment. Stored timestamps are preserved; MySQL NOW() drives rate limiting. Email timestamps and CSV filenames use IST.

## Preserved behavior

- POST `/api/submit_prospect.php`: existing frontend payload, lead storage, mirror scores, response reasons, five submissions per IP per ten minutes, and notification email.
- `/admin/prospects.php`: password-protected original admin layout, newest leads first.
- `/admin/export_csv.php`: all columns exported with a UTF-8 BOM for Excel.
- Extensionless versions of these routes are also available.
- SMTP failures still leave the lead saved and return success, with email_sent remaining zero.
- Static frontend and client-side route fallback are served by Node. Request bodies are capped at 64 KB; admin responses are not cached.

## Production cutover

Back up the database and old deployment. Copy the PHP configuration values into `.env`, install with `npm ci --omit=dev`, and run `npm start` under a process supervisor from this directory. Keep `.env` outside the public web root.

Configure the existing HTTPS Apache/Nginx virtual host to reverse-proxy ALL paths, including `.php` URLs, to `http://127.0.0.1:3000`. Do not route these requests to PHP-FPM. Node does not read `.htaccess`. Use HTTPS for admin Basic authentication.

If a local proxy replaces incoming X-Forwarded-For and Node is reachable only through it, set `TRUST_PROXY=loopback`; otherwise leave false until proxy trust rules are configured. This ensures rate limiting uses the correct visitor IP.

Before switching traffic, submit a test lead, verify MySQL storage and actual SMTP delivery, and check admin login and CSV download. These checks require deployment credentials. Keep the previous deployment available for rollback.

## Files

- `server/`: Node application and original admin HTML template.
- `gyanisays.com/html/`: unchanged frontend build.
- `database/schema.sql`: optional fresh-install schema.
- `test/`: HTTP tests with isolated database/mail doubles; no real mail is sent.

PHP endpoints and Composer files have been removed. Existing `.php` URLs are compatibility routes handled entirely by Node.js.

## Public application form and event administration

Requires Node.js 24+. The original form from `GYANISAYS/application form/public` is integrated at `/application/` and linked from the website. It retains the picnic branding, four steps, RSVP, department, food, activity comfort, care notes, spouse and up to four children. Visitors do not log in.

Visit `/admin/event/` (or `/admin`) with the existing `GYS_ADMIN_USER` / `GYS_ADMIN_PASS`. The admin includes:

- Bulk names: download the CSV template, upload or paste CSV, preview, then import. Supported headers: `name`, `department`, `external_id`. Only name is required. Import up to 5,000 rows / 2 MB; export Excel files as CSV first.
- Names and departments become searchable in the public form. Selecting a name prefills its department when available. People not listed can enter their own name.
- Reimport updates matching external IDs, or matching name + department when no ID is provided. Use stable external IDs for people with identical names/departments. Exact duplicate keys within a file are skipped (first row wins). Existing submitted applications remain snapshots of what was submitted.
- Clear names hides the selectable list, without deleting registrations. Reimporting the same IDs restores the entries. Clearing names is not cancellation of applications.
- Attendance scope: confirmed, tentative or all responses. Meal and head counts include spouses and children; adult alcohol counts exclude children. Charts separate departments, adult ages, child age bands, gender, food, activity comfort and companies.
- Searchable full-detail roster, confidential care notes, CSV export, saved company assignments, activity catalog and awards. The kids manifest includes confirmed children only and excludes names and medical information.

Event records use the existing form's Node.js/SQLite approach, isolated from the website's MySQL lead database. The persistent file defaults to `data/events.sqlite`; set `GYS_EVENT_DB` to a persistent absolute path on the server. Give the Node service write access to that folder. Back up the SQLite file with a SQLite-aware backup tool, or stop the service before copying the file and any WAL files. Do not put this database in the public web directory or use an ephemeral deployment disk. Production is intended for one Node application instance using this local file.

`npm run preview:event` starts an independent local preview at port 3080, without MySQL/SMTP credentials. It prints a temporary admin login and writes only to `data/preview-events.sqlite`. This preview does not send mail or process website leads; production uses `npm start`. Any Demo-labelled entries in preview are test data, separate from production.

Names and departments are intentionally public in the picker; medical/family data is admin-only. Selecting a name does not verify identity. A selected imported name can submit once; retries are idempotent, and corrections should go through the organiser. No participant lookup exposes previous responses. Keep HTTPS and your existing protected admin credentials for deployment.

The event remains configured for the original Apollo picnic on 15 November 2026. No real participant data has been imported or copied from the older application's database.

Admin sharing: the dashboard includes Copy link and Download QR. Both point directly to /application/ with no participant login. Set GYS_PUBLIC_SITE_URL to the deployed HTTPS origin (for example https://gyanisays.com) to ensure links use the public domain behind a proxy. Localhost QR codes are labelled as local previews and cannot be used from another person's phone. QR images are generated locally; no external QR service receives the URL.
