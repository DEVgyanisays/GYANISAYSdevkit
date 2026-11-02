# Deployment guide

## Docker on a Linux server

Requirements: Docker Engine with Compose v2, a domain pointing to the server and free ports 80/443. Supply a valid domain TLS certificate from your certificate provider or ACME client. Certificate issuance/renewal is not automated by this package.

1. Extract the complete package on the server.
2. Copy .env.example to .env. Replace every placeholder. Set DOMAIN to the bare hostname and GYS_PUBLIC_SITE_URL to its HTTPS origin, e.g. https://events.example.com. Use strong distinct admin/database/root passwords. Supply working SMTP settings and the correct lead notification recipient. Follow Compose env quoting rules for special characters; single quotes prevent dollar interpolation.
3. Create nginx/certs/ and install fullchain.pem and privkey.pem for DOMAIN. Restrict key access and keep it out of version control.
4. Run `sh deploy.sh`. It validates Compose configuration, builds React and starts MySQL, Node and Nginx. It does not request certificates or modify DNS.
5. Verify https://YOUR_DOMAIN/healthz, the homepage, /application/ and /admin/event/. Sign in with GYS_ADMIN_USER and GYS_ADMIN_PASS using the browser's HTTP Basic login prompt. Always use HTTPS. Credentials are configured in .env, not through signup. The same credentials protect /admin/prospects.php.
6. Import a small CSV, submit a public registration, refresh the dashboard and check counts. Verify website lead storage and actual email delivery with your own test address. Check that the QR opens the public HTTPS domain.

The base Compose file binds HTTP to loopback port 8080. The HTTPS overlay adds public ports 80/443 and redirects HTTP to HTTPS. Do not expose the base HTTP listener publicly for organiser access. Backend and MySQL have no host ports. Nginx replaces forwarding headers and Node trusts one proxy hop.

Behind an existing TLS reverse proxy, run `docker compose up -d --build` and forward its local listener to 127.0.0.1:8080. Set GYS_PUBLIC_SITE_URL explicitly. Review forwarding headers for your proxy topology.

Renew certificates before expiry, replace the files, then run:

```sh
docker compose -f docker-compose.yml -f docker-compose.https.yml exec nginx nginx -t
docker compose -f docker-compose.yml -f docker-compose.https.yml exec nginx nginx -s reload
```

## Persistence and updates

mysql_data stores website leads; event_data stores SQLite registrations, imported names and organiser arrangements. MySQL initialization runs only on a fresh empty volume. Existing website data is not bundled or automatically migrated: export/import it separately before replacing a live installation.

Back up MySQL with mysqldump. Back up SQLite with its online-backup API, or stop the backend and copy the complete event volume before restarting. Test restores. Do not run `docker compose down -v` on a live installation: it deletes named volumes. Keep the Compose project name/directory stable so updates reuse the same volumes. Re-run `sh deploy.sh` for source updates; normal rebuilds retain data.

Run one backend instance with this SQLite deployment. Do not distribute its file across independent servers or ephemeral/serverless filesystems.

## Direct Node deployment

Install Node.js 24+, provision MySQL and import backend/database/schema.sql into the intended database. Run `npm run setup` and `npm run build`. Copy backend/.env.example to backend/.env and configure database, SMTP, admin and public URL settings. Set GYS_EVENT_DB to a durable writable path. Run `npm start` under your host service manager. Node serves both the original site and React application.

Terminate HTTPS at your reverse proxy. Leave TRUST_PROXY=false for direct access; configure proxy trust only when forwarding headers are overwritten and clients cannot bypass the proxy. Port defaults to 3000. Docker deployments use the root .env instead.

## Delivery verification

The React production build and Node automated tests pass. Local browser checks cover CSV import, public name selection/autofill, family registration and matching dashboard totals. Docker is not installed in the preparation environment, so container build/start and Nginx TLS execution have not been tested here. Public domain, production MySQL and SMTP delivery need validation on the deployment server.
