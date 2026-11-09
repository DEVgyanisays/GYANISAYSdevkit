# Present Saarthi

Open http://127.0.0.1:4174/login on this computer. If it is stopped, double-click Start Saarthi.cmd in this folder (or Open Saarthi App.cmd in GYANISAYS).

Use your existing administrator credentials. The original database remains in backend/data; a backup was taken before the location update.

Presentation path: Login > New applicant > Country > State / region > City / town; then sign in as administrator to show Applications, review, and the role-specific workspace. Application submissions save real records. Do not submit made-up records into this database just for presentation.

Location lists are served locally without API keys: 250 countries/territories, 5,327 subdivisions and 152,378 city/town entries from the Countries States Cities Database snapshot retrieved 26 October 2026. Lists are not a guarantee of every settlement; an unlisted city can be entered manually. Source, license and derived dataset links appear in the form. Existing applications remain intact; historical location fields are left blank rather than inferred.

This is the current implemented application with real local backend and SQLite storage. It is not an internet-hosted deployment. Email delivery, Aarambh, Google configuration and the remaining workflows documented in backend/IMPLEMENTATION_STATUS.md are still pending. No ZIP is needed for presenting this running app on your computer or by screen sharing.

Coach login without email: after acceptance and batch enrolment, open People & access > Manage the invited coach > Create activation link. Open the link in a private browser window, set your own password, then sign in with the coach email and Login as Coach. Links expire after 30 minutes and work once; creating another replaces the previous invitation. This admin-only option is disabled in production and non-loopback installations. Password fields have Show/Hide controls.
