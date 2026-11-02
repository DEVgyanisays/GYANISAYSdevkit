# GyaniSays · React + Node.js

Start with SETUP_STEPS.md. The public application, organiser dashboard and website leads dashboard have editable React components. The original website design and assets are retained.

```text
frontend/
  src/              Editable React application and admin
  dist/             Ready-built application/admin UI
  website/          Original compiled React website and assets
backend/
  server/           Express APIs, authentication, email and storage
  database/         MySQL website-leads schema
  test/             API and security checks
  Dockerfile
docs/               Deployment guide
nginx/              Reverse proxy and HTTPS configuration
.env.example
docker-compose.yml
docker-compose.https.yml
deploy.sh
package.json
package-lock.json
SETUP_STEPS.md
```

The original homepage was supplied as compiled React assets without its editable component source. It is preserved in frontend/website. The application and admin pages have new React source in frontend/src. The small index.html is the normal React mounting document. No PHP runtime is needed; legacy .php URLs are handled by Node for compatibility.

Features: public registration without login, CSV name import and autofill, family information, protected organiser login, QR/link sharing, charts, detailed responses, CSV exports, group planning, activities and awards.

No passwords, private databases, test registrations or node_modules are included. Production needs your domain, admin credentials, MySQL and SMTP settings.
