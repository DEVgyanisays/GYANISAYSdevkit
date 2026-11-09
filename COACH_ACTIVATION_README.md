# Coach activation update — source checkout

This branch contains the standalone Gyani Says Node/SQLite application based on the original developer kit. The current remote main branch contains a different website; do not deploy this branch over it or merge it blindly.

## Run locally
1. Install Node.js 24 or newer.
2. From this folder, run `cd backend` and `npm start`.
3. Open http://127.0.0.1:4174. A fresh database offers initial administrator setup. Existing local accounts and passwords are not included in Git.
4. Admin: Applications > Review > Approve & activate coach. Choose tier/category/rank, give a reason and confirm bypass.

45 backend tests pass using `npm test` from backend. This Git checkout does not bundle the Windows Node runtime; install Node before using Start Saarthi.cmd.

See DIRECT_ACTIVATION_CHANGES.txt for deployment boundaries. aarambh-update/CoachingTab.jsx is an integration patch to review and merge into the corresponding Aarambh frontend, not an independently runnable Aarambh project. Configure private backend/.env locally using backend/.env.example. Live deployment and external service credentials are not included.
