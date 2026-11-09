# Team testing

1. Extract the entire ZIP to a writable folder on Windows x64.
2. Double-click Start Saarthi.cmd. The included Node runtime starts the real backend and opens frontend/index.html.
3. Create your own administrator account. No demo accounts or shared passwords are included.

You can reopen frontend/index.html while the backend is running. After restarting Windows, run the launcher again. A standalone HTML file cannot start a database server; the launcher is required.

Each extracted copy has its own persistent database in backend/data. Teammates do not share records. Share only the original clean ZIP, never your used folder containing accounts and data. Shared online use requires hosting.

The assistant searches local knowledge without API keys. Generated RAG answers additionally require local Ollama with llama3.2:3b on port 11434. Without it, results are clearly labelled retrieval-only. The model is not bundled.

Email delivery, Aarambh, hosting, Analytics and Search Console remain unconfigured. Read backend/IMPLEMENTATION_STATUS.md and backend/LAUNCH_AUDIT.md for outstanding workflows. This is a real local testing build, not a verified complete production deployment.

Closing the browser leaves the backend running. Its process ID is in backend/logs/launcher.json. To stop it, end only that node.exe process in Task Manager, or restart Windows. Logs are in backend/logs/server.log.
