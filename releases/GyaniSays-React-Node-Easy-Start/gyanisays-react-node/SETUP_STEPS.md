# Run the package

**Windows quick start:** install Node.js 24+, extract the entire ZIP, and double-click `START-WEBSITE.cmd` in the project root. It installs backend dependencies on first use, starts the preview and opens the complete homepage in your browser. Keep its terminal window open. Internet is needed for the initial installation. This uses the included React build; no frontend build command is required.

Opening `frontend/index.html` directly displays startup help because browsers cannot execute JSX or start a Node server from a local HTML file. Once running, use http://127.0.0.1:3080/ for the full site. Preview supports the event form and admin; production website leads/email need MySQL/SMTP configuration below.

Install Node.js 24 or newer. Extract the ZIP and open a terminal in the project folder containing this file.

```sh
npm run setup
npm run preview
```

Open http://127.0.0.1:3080/ for the original website, http://127.0.0.1:3080/application/ for the public form and http://127.0.0.1:3080/admin/event/ for organisers. The terminal prints a fresh temporary admin username/password each time preview starts. Participants need no login. Stop with Ctrl+C.

Preview stores events separately in backend/data/preview-events.sqlite. Website lead submission/email and the leads dashboard require production MySQL/SMTP settings and are unavailable in preview. Preview is local-only. If port 3080 is busy, in PowerShell set `$env:PREVIEW_PORT=3081` before running the preview command.

## Edit React

Edit frontend/src, run `npm run build`, then refresh the browser. The included production build allows immediate preview after setup. Run `npm test` for backend checks. Original homepage assets are in frontend/website; their uncompiled source was not supplied.

## Deploy

Follow docs/DEPLOYMENT.md. On a Linux Docker server, copy root .env.example to .env, configure real values, install the domain certificate, then run `sh deploy.sh`. Docker builds React and runs Node, MySQL and Nginx with persistent volumes.

For an existing Node/MySQL server, use backend/.env.example as described in the guide. Root .env is for Docker; backend/.env is for direct Node startup. Never share either credentials file.
