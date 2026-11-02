# Node.js backend

See ../SETUP_STEPS.md and ../docs/DEPLOYMENT.md. This folder contains Express APIs, MySQL website leads, SMTP integration, SQLite event storage and tests. Requires Node.js 24+.

Direct Node startup reads backend/.env; Docker reads the project-root .env through Compose. Never distribute real credentials or data/ files.
