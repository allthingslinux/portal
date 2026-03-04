## [2.0.2](https://github.com/allthingslinux/portal/compare/v2.0.1...v2.0.2) (2026-03-04)


### Bug Fixes

* **release:** run semantic-release from repo root ([4b691b2](https://github.com/allthingslinux/portal/commit/4b691b2ecebcf57d79c8b03466e3f739da12aee7))

## [2.0.1](https://github.com/allthingslinux/portal/compare/v2.0.0...v2.0.1) (2026-03-04)


### Bug Fixes

* **release:** move .releaserc.json to apps/portal/ and backfill v2.0.0 changelog ([c166a30](https://github.com/allthingslinux/portal/commit/c166a30bac48ed4635026e3858b1f43e6e0a4b97))

# [2.0.0](https://github.com/allthingslinux/portal/compare/v1.7.0...v2.0.0) (2026-03-03)

* refactor!: migrate to turborepo monorepo ([a879699](https://github.com/allthingslinux/portal/commit/a87969964349d54fc3f64857df424d3450bd8984))

### Bug Fixes

* **ci:** add test:coverage task to turbo.json ([e44c4b9](https://github.com/allthingslinux/portal/commit/e44c4b965bf827bf5247c15289b6438887249dbf))
* **db:** add better-auth v1.5 api-key schema migration ([f39f5e3](https://github.com/allthingslinux/portal/commit/f39f5e398c25825d6dc0aee707d8344194ed9594))
* **docker:** set PNPM_HOME for global turbo install in pruner stage ([fe9fa03](https://github.com/allthingslinux/portal/commit/fe9fa032eb108c6ede641cd05797d7508296e813))

### BREAKING CHANGES

* repository restructured from flat Next.js project to
Turborepo monorepo with pnpm workspaces.

Structure:
- apps/portal/ — Next.js application (@portal/portal)
- packages/db/ — Drizzle schema, client, migrations (@portal/db)
- packages/api/ — TanStack Query, server queries (@portal/api)
- packages/types/ — centralized TypeScript types (@portal/types)
- packages/schemas/ — shared Zod validation schemas (@portal/schemas)
- packages/utils/ — shared utilities and constants (@portal/utils)
- packages/ui/ — shared UI components (@portal/ui)
- packages/email/ — email service (@portal/email)
- packages/observability/ — Sentry, OpenTelemetry (@portal/observability)
- packages/seo/ — metadata helpers (@portal/seo)
- packages/typescript-config/ — shared TS configs

All root commands (pnpm dev, build, test, type-check, db:*) are
preserved via Turborepo pipeline orchestration.

# [1.7.0](https://github.com/allthingslinux/portal/compare/v1.6.0...v1.7.0) (2026-03-03)


### Bug Fixes

* **db:** correct import path for createInsertSchema and createSelectSchema in mailcow schema ([b8750e1](https://github.com/allthingslinux/portal/commit/b8750e1d29fbd55ae284373989beb0ab0f999c1c))
* **db:** update import path for createInsertSchema and createSelectSchema from drizzle-zod to drizzle-orm/zod ([f7cfc0b](https://github.com/allthingslinux/portal/commit/f7cfc0be682d17294a420c6e64ee278a7c3513b1))
* **db:** update import path for createInsertSchema and createSelectSchema in xmpp schema ([0692b4c](https://github.com/allthingslinux/portal/commit/0692b4cb5f6cb8fc9f2b1fc98b4b3f01d3731798))
* **irc:** fix Atheme JSON-RPC id type and empty param handling ([71f623c](https://github.com/allthingslinux/portal/commit/71f623cd757ef21f1c058cc8917b13fdcf1b25be))
* **mailcow:** ensure submit label is correctly displayed in MailcowCreateForm ([89471db](https://github.com/allthingslinux/portal/commit/89471dbbaa5b45ea4cc7bfb6dfafd5f70ee45582))
* **migrate:** update config file path for database migrations ([b940a56](https://github.com/allthingslinux/portal/commit/b940a5666f632a1b440adedc8c0e80949ae5d4ba))
* **user:** update import path for createSelectSchema from drizzle-zod to drizzle-orm/zod ([2000990](https://github.com/allthingslinux/portal/commit/200099064c52d605b81eb43a2d3c6fce1b2d14f0))
* **wiki:** decrease recent changes limit from 6 to 5 ([908a691](https://github.com/allthingslinux/portal/commit/908a69136a831a20d20cd4efb767a5b6921d3c08))
* **xmpp:** switch Prosody REST client from Basic to Bearer token auth ([1325037](https://github.com/allthingslinux/portal/commit/13250371a00c8c4587b0631050a8543df4d8b8d5))


### Features

* **admin:** add Mailcow accounts API and management UI ([4e31ded](https://github.com/allthingslinux/portal/commit/4e31ded7afbf9d953d904626c4d45400fd7358d7))
* **auth:** add endpoint to clear stale sessions and redirect to sign-in ([0e14673](https://github.com/allthingslinux/portal/commit/0e1467399639216bfa12e519caa372de3b96a2b3))
* **auth:** add Mailcow OAuth sign-in provider with logo icon ([f8fd51e](https://github.com/allthingslinux/portal/commit/f8fd51ea5c45786b981d33e812cd066a3163a173))
* **auth:** implement check for stale sessions and redirect to clear session endpoint ([5686917](https://github.com/allthingslinux/portal/commit/56869178d6dc9e22faff88e4d3b94533565d7d5a))
* **dashboard:** update quick links and enhance AppPage styling ([4c672bc](https://github.com/allthingslinux/portal/commit/4c672bcc86d3d39c8d4c5813c65db863548d8b50))
* **db:** add script to wipe the database by dropping and recreating the public schema ([7a48068](https://github.com/allthingslinux/portal/commit/7a48068f9f53fd54df6efcbd5be1c7b1e9bb6d60))
* **feed:** add new feed page for Linux and open-source news ([ca447f3](https://github.com/allthingslinux/portal/commit/ca447f3576c4ecfed5e5378ae84d8c2a63df2cc2))
* **integrations.ts:** add resetIntegrationPassword function to reset passwords for integration accounts ([f83cba9](https://github.com/allthingslinux/portal/commit/f83cba9650aee1b59806495c742aa6d6316ac11d))
* **integrations:** add XMPP password dialog and enhance integration management ([2bf2e62](https://github.com/allthingslinux/portal/commit/2bf2e627711d6efc79aa2f97be2f56ebd13fec93))
* **integrations:** enhance integration management with dialogs and stats ([0ce6477](https://github.com/allthingslinux/portal/commit/0ce6477088da11a440d3f0605ddea9744993a7f1))
* **irc:** enhance password reset and error handling for Atheme integration ([0c20eaa](https://github.com/allthingslinux/portal/commit/0c20eaa1e614ea679e668c6f490d6e5a9378f84f))
* **mail:** add mail page with Mailcow registration form ([7c371b0](https://github.com/allthingslinux/portal/commit/7c371b0ca5d5a8d72214401bce68ccd2b88fc865))
* **mailcow:** add database schema and migration ([f1e06fd](https://github.com/allthingslinux/portal/commit/f1e06fd095b601d15e7121317274bb33b7314b38))
* **mailcow:** add REST API client and integration implementation ([f033a49](https://github.com/allthingslinux/portal/commit/f033a49f69f131323e4b7eee6bfd1259d675efb6))
* **mailcow:** enhance mail integration with alias and app password management ([8f537f7](https://github.com/allthingslinux/portal/commit/8f537f70261fb9ed6f87cd857fb74cb946b13b89))
* **reset-password:** add IRC password reset support alongside XMPP ([2dbaee9](https://github.com/allthingslinux/portal/commit/2dbaee9bcacecb6755583c207883089bc622df72))
* **route.ts:** add support for service token authentication ([092403d](https://github.com/allthingslinux/portal/commit/092403dcf6c8f6b1b4198e90fba015e0b8621010))
* **routing:** add mail route ([fc802a0](https://github.com/allthingslinux/portal/commit/fc802a0f90faa301589dc15c584ab5483103e55e))
* **schemas:** make password optional for IRC and XMPP account creation ([9f50408](https://github.com/allthingslinux/portal/commit/9f50408f2870dfde41fef4032c349ac62268a5e5))
* **ui:** add render and nativeButton props to Button component ([c63fcba](https://github.com/allthingslinux/portal/commit/c63fcbadc656ece87c276c50aca2ffffd1778897))
* **use-integration.ts:** add useResetIntegrationPassword hook ([faa8c13](https://github.com/allthingslinux/portal/commit/faa8c136efac8cefbd407e872a806706c3b9e949))
* **wiki:** enhance RecentWikiChangesCard with improved layout and diff display ([6becd0f](https://github.com/allthingslinux/portal/commit/6becd0f8cfda8bf7d4017fdefd66ca09cbffccbd))
* **xmpp:** enhance error handling and add server stats retrieval ([0ece40a](https://github.com/allthingslinux/portal/commit/0ece40a7b9931e0b2b21579b32856066be16b299))


### Performance Improvements

* parallelize independent DB queries with Promise.all and use toSorted ([080655a](https://github.com/allthingslinux/portal/commit/080655aebf5303d34ab8b0ac4f3b8c4f03ea9ff9))


### Reverts

* **patch:** remove atl-chat-mod-http-oauth2.patch to rollback OAuth2 integration ([0c5bfc6](https://github.com/allthingslinux/portal/commit/0c5bfc612cf0a37adfcaf50dee8e3ee6d9f815e6))

# [1.6.0](https://github.com/allthingslinux/portal/compare/v1.5.1...v1.6.0) (2026-02-22)


### Bug Fixes

* address react-doctor lint warnings ([04028eb](https://github.com/allthingslinux/portal/commit/04028eb5d625c21d8685dda3cedc58cae4ca3ffd))
* **api/sessions:** exclude session token from GET /api/user/sessions response ([1601e94](https://github.com/allthingslinux/portal/commit/1601e94327498437b13163903fd2ed09e4395b6e))
* **app-error:** update button rendering for back to dashboard link ([1e14fb9](https://github.com/allthingslinux/portal/commit/1e14fb999431259b17238ca6a2e6bd86b5f1c058))
* **auth:** silence BetterAuth oauthAuthServerConfig startup warning ([4727d93](https://github.com/allthingslinux/portal/commit/4727d93fa6db67e55e7ba15162a7f16cefbffdaa))
* **breadcrumb-trail:** update key generation for breadcrumb items ([cc61acc](https://github.com/allthingslinux/portal/commit/cc61accde80bcea4ce9c41f35b848cbb52914146))
* **breadcrumb:** simplify breadcrumb rendering by removing unnecessary wrapper elements ([66b98ab](https://github.com/allthingslinux/portal/commit/66b98aba088dddef27fe9902c97b4aa44c9d03c9))
* **config:** fix image remotePatterns and spread order in next.config.ts ([35eaad2](https://github.com/allthingslinux/portal/commit/35eaad2441c6a647a58c6b3fc175a0760ae52580))
* **data-table, irc-accounts-management, xmpp-accounts-management:** update button rendering to use render prop for improved consistency ([31a9b0e](https://github.com/allthingslinux/portal/commit/31a9b0eb6042c14e758b93b6c7cfe7cbfeeafc49))
* **db:** cache pool on globalThis to prevent connection exhaustion during HMR ([1988c2f](https://github.com/allthingslinux/portal/commit/1988c2ffdd9bbc992e83a0d80415353225227133))
* **error-content:** update button rendering for go home link ([1d533e0](https://github.com/allthingslinux/portal/commit/1d533e0c9fc0b5c7a6f1dc48f72d8d3d01029a93))
* **global-error:** simplify error messages and remove translation dependency ([55d4860](https://github.com/allthingslinux/portal/commit/55d486040c70ac7d3e50807755ee146a08f2e955))
* **header:** update AppHeader layout and styling ([e3946f2](https://github.com/allthingslinux/portal/commit/e3946f28b71f872de3836c4e6ee509b931028af1))
* **navigation:** update button rendering in NavCollapsible and NavItem components ([3001f4e](https://github.com/allthingslinux/portal/commit/3001f4e788040e34eca5b6dca37a6bfe2bfd10da))
* **not-found:** update button rendering for navigation links ([53f42ca](https://github.com/allthingslinux/portal/commit/53f42ca0396aac97ec7641ef4b95255c68e3c266))
* **not-found:** update button rendering for navigation links ([a5162e2](https://github.com/allthingslinux/portal/commit/a5162e2a55cda8fed3bc1b9b66828f4bd33d2c84))
* **page:** update button rendering for navigation links ([ee048e7](https://github.com/allthingslinux/portal/commit/ee048e7ea4a84e56bf4f49810550b6a9bedf66bf))
* **vitest:** replace __dirname with import.meta.dirname in vitest.config.ts ([b1b5283](https://github.com/allthingslinux/portal/commit/b1b5283eab90e6e483f1fa2e73497da18f6123c9))
* **wiki:** increase recent changes limit from 5 to 6 ([3097fa2](https://github.com/allthingslinux/portal/commit/3097fa25236248902f980a49791da29ae176573f))


### Features

* add cursor commands ([50e7ea9](https://github.com/allthingslinux/portal/commit/50e7ea91f70cd8a61976bed890c08293e8af8993))
* **admin:** add useAdminXmppAccounts hook for fetching XMPP accounts ([3aa0c57](https://github.com/allthingslinux/portal/commit/3aa0c57878c716549dfd4482dd61db2f2996c02c))
* **admin:** wrap AdminDashboard in PageContent for improved layout ([b145cb6](https://github.com/allthingslinux/portal/commit/b145cb6f5cf8c6e33b2b3b2c7570911a9a84b010))
* **api/admin:** add admin IRC/XMPP account routes and integration password reset ([606cc67](https://github.com/allthingslinux/portal/commit/606cc67ae1c7e225d2868ec565536365158af4d4))
* **api/admin:** add fetchXmppAccounts function to retrieve XMPP accounts ([f1ca84a](https://github.com/allthingslinux/portal/commit/f1ca84a645b7465a0f1aa8814438f35624948586))
* **api/query-keys:** add query keys for XMPP accounts management ([7a6f64d](https://github.com/allthingslinux/portal/commit/7a6f64dcf96c78fa4edecf0ae92d80945825168c))
* **api/types:** add new XMPP account response types ([8b4ff77](https://github.com/allthingslinux/portal/commit/8b4ff77fbe119542c1cf95b1558e156c5f1d4f2e))
* **api/types:** extend API types with XMPP account interfaces ([138d1df](https://github.com/allthingslinux/portal/commit/138d1dfe51607f343f17e0fdd88515014db0bbac))
* **auth:** enable Discord as social OAuth provider in sign-in UI ([87f06d8](https://github.com/allthingslinux/portal/commit/87f06d87cad54e314f7d57c7b690cbb6bbd67310))
* **blog:** add LatestUpdatesCard component to display latest blog posts ([349690e](https://github.com/allthingslinux/portal/commit/349690eb5ff7deb7d7106c99a64013202e25a99e))
* **config:** add community and donation links configuration ([6dbb79a](https://github.com/allthingslinux/portal/commit/6dbb79a734476a8dd15007c7b21a0f3b6c8f9a88))
* **config:** update application versioning and style configuration ([975eaa6](https://github.com/allthingslinux/portal/commit/975eaa6de21f32dc4c1005478304b559cf02dc65))
* **connect:** implement ConnectPage for community and social media links ([4a008d9](https://github.com/allthingslinux/portal/commit/4a008d95b1c3b6552f8bc0fe77d61be25ddcc107))
* **dashboard:** add XMPP accounts management to admin dashboard ([eadc1a9](https://github.com/allthingslinux/portal/commit/eadc1a9ca56226361e5b8fa7193412c89b63b6cf))
* **dashboard:** enhance AppPage with new stat cards and quick links ([ac62fdb](https://github.com/allthingslinux/portal/commit/ac62fdb5afe3f2970a401b22ede108ba0bbfc7d4))
* **dashboard:** mount DiscordStatsCard on overview page ([96d2b0b](https://github.com/allthingslinux/portal/commit/96d2b0bf20ade1656e92d14282451893942d083f))
* **dashboard:** wrap loading UI in PageContent for improved layout ([cd4cc4d](https://github.com/allthingslinux/portal/commit/cd4cc4d88723933e0bfd7f58fd9510bbc83ca340))
* **dev-tools:** add environment keys for development tools configuration ([2c5c5c1](https://github.com/allthingslinux/portal/commit/2c5c5c1ffc78fd02a919afa15094cffe54cd13e1))
* **dev-tools:** enhance DevTools component with environment-based toggling ([a094a69](https://github.com/allthingslinux/portal/commit/a094a693e2621a2d0caf2837e681f7a2a146fd4d))
* **discord:** add Discord REST client, env keys, and stats card ([f2fc07c](https://github.com/allthingslinux/portal/commit/f2fc07c91106547fd0d33b90a9e7ac8195c41314))
* **discord:** add DiscordMemberStat component to display member statistics ([191bc1b](https://github.com/allthingslinux/portal/commit/191bc1b2dd31d0059221e533ac7d8abbe880a788))
* **donate:** add DonatePage for community support and contributions ([9cd59b3](https://github.com/allthingslinux/portal/commit/9cd59b38603fdbb8b479fd871425946e32fa27eb))
* **env:** add devTools and mediawiki keys to environment configuration ([f6e958c](https://github.com/allthingslinux/portal/commit/f6e958c5e49cd8ee28398e26baf768058ff5fe21))
* **feed:** implement blog feed fetching functionality ([1969e78](https://github.com/allthingslinux/portal/commit/1969e788f79a1028ff40301ac4ef0f9002b0f1aa))
* **input-group:** enhance InputGroupAddon accessibility and interaction ([e89e4d4](https://github.com/allthingslinux/portal/commit/e89e4d4e82aa3dbc513080b151b704d19085b214))
* **integrations:** add IRC and XMPP account details components ([6c6809e](https://github.com/allthingslinux/portal/commit/6c6809e0f0b134c437545b86a3b892e58f015c4d))
* **integrations:** wrap IntegrationsPage in PageContent for improved layout ([c7c4564](https://github.com/allthingslinux/portal/commit/c7c4564d2e950fe3506211e0fd3066aa67e9856f))
* **irc-accounts:** add status filter to IRC accounts management ([6f38f76](https://github.com/allthingslinux/portal/commit/6f38f765a9039b59883333a141a52773ef7ed38d))
* **irc:** expand Atheme JSON-RPC client with oper commands ([8f89668](https://github.com/allthingslinux/portal/commit/8f896687fa3187c614bd121777f3c98e54356acc))
* **irc:** expand UnrealIRCd JSON-RPC client with full API surface ([7c8eed3](https://github.com/allthingslinux/portal/commit/7c8eed3a177d5b169019d9cd862e1758d9eff82e))
* **layout:** enhance AppLayout with StatusBar and TooltipProvider ([c4b4282](https://github.com/allthingslinux/portal/commit/c4b428290172f3861397807ca86d430154608ba8))
* **mediawiki:** implement MediaWiki API client for read-only operations ([c201eb8](https://github.com/allthingslinux/portal/commit/c201eb8d83a94f467b8d2f02905c1ec1876628a0))
* **routing:** update route configuration and add donation page ([05592e8](https://github.com/allthingslinux/portal/commit/05592e82cdf4bcb10f4c1be7cef5bdc034d9584c))
* **seed:** implement database seeding for mock users and integration accounts ([cbe113a](https://github.com/allthingslinux/portal/commit/cbe113ae9f008c6e5ae5d373d69b591461f635e6))
* **settings:** wrap SettingsPage in PageContent for improved layout ([a33a04b](https://github.com/allthingslinux/portal/commit/a33a04b1fe222bb4f3d8c4eabb61c7dc40e6123b))
* **styles:** add canvas color variable to global styles ([bec2e8d](https://github.com/allthingslinux/portal/commit/bec2e8d2c23db9afe76c0e8e8b09eccca101dc5a))
* **use-is-client:** add useIsClient hook for client detection ([de5fd55](https://github.com/allthingslinux/portal/commit/de5fd554edff4b7ccf590038d59ce6292010cab0))
* **wiki:** add RecentWikiChangesCard component to display recent changes ([98b45e9](https://github.com/allthingslinux/portal/commit/98b45e95f031bbd182e996abee900b34c527c6d8))
* **wiki:** implement functions to fetch recent changes and site statistics ([fa7a430](https://github.com/allthingslinux/portal/commit/fa7a430e9f9c8f266046ad55739ff5d7dea7de05))
* **xmpp-accounts:** implement XMPP accounts management component ([aa1cb1e](https://github.com/allthingslinux/portal/commit/aa1cb1e4884ee2dd97aed67eeca13ef112b3d0ea))
* **xmpp:** migrate Prosody client to mod_http_admin_api ([5759342](https://github.com/allthingslinux/portal/commit/5759342a0509760133216bde5e5cd383240646d6))

## [1.5.1](https://github.com/allthingslinux/portal/compare/v1.5.0...v1.5.1) (2026-02-21)


### Bug Fixes

* **bridge/identity:** snake_case response fields, add discord_id to IRC/XMPP lookups ([490b273](https://github.com/allthingslinux/portal/commit/490b2738c7f02b7d4c657503ef5c14de0065e693))

# [1.5.0](https://github.com/allthingslinux/portal/compare/v1.4.2...v1.5.0) (2026-02-21)


### Features

* **auth:** enable Discord OAuth and add bridge identity endpoint ([a93aa39](https://github.com/allthingslinux/portal/commit/a93aa3979d7cd99f1d568ef610f3188360205c88))
* Pass `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and `GIT_COMMIT_SHA` as build arguments to the Docker image and configure the workflow environment. ([9927b2b](https://github.com/allthingslinux/portal/commit/9927b2b63a179ef9b121ca2239ded8f26c4e0a30))

## [1.4.2](https://github.com/allthingslinux/portal/compare/v1.4.1...v1.4.2) (2026-02-08)


### Bug Fixes

* **deps:** update critical ([#42](https://github.com/allthingslinux/portal/issues/42)) ([176b4bd](https://github.com/allthingslinux/portal/commit/176b4bd4eb1d7deb8a775a915581738d8b8d10b4))

## [1.4.1](https://github.com/allthingslinux/portal/compare/v1.4.0...v1.4.1) (2026-02-03)


### Bug Fixes

* **deps:** update dependency drizzle-zod to v1.0.0-beta.9-e89174b ([#40](https://github.com/allthingslinux/portal/issues/40)) ([7a967eb](https://github.com/allthingslinux/portal/commit/7a967eb2356d180ae9e5779265528b19bf81f3db))

# [1.4.0](https://github.com/allthingslinux/portal/compare/v1.3.0...v1.4.0) (2026-02-02)


### Bug Fixes

* add validation to update schema fields per PR feedback ([3b7e318](https://github.com/allthingslinux/portal/commit/3b7e318bfeb2259543fc01d4534d62d58c0b5b22)), closes [#37](https://github.com/allthingslinux/portal/issues/37)
* address Cubic AI code review findings ([45e3071](https://github.com/allthingslinux/portal/commit/45e30718c8566e973107607ae43ef13286db3a03))
* **deps:** align drizzle-zod version with drizzle-orm beta ([edf7a1e](https://github.com/allthingslinux/portal/commit/edf7a1e045455d5239e6aefe89e7a75cd749c4db))
* handle invalid JSON request body with a 400 API error. ([9e10870](https://github.com/allthingslinux/portal/commit/9e10870bb8356972d95363d016723f4ece85ca69))
* implement safe metadata parsing and refine linter config ([0e8888b](https://github.com/allthingslinux/portal/commit/0e8888b266738f8e68d0353ed9c2dba53971f4f6))
* **integrations:** add UI validation guard to prevent empty payload ([7a17f85](https://github.com/allthingslinux/portal/commit/7a17f85de05b75abd03a3f0dd5c8d5a673d3411d))


### Features

* **base.ts:** add support for schema validation using zod ([80a3e4a](https://github.com/allthingslinux/portal/commit/80a3e4a8f31963a617af407b7c94f2d8a63d9a15))
* **core:** integrate zod-validation-error and enhance integration base types ([1ab3376](https://github.com/allthingslinux/portal/commit/1ab3376f2c6d86a69e930658deb31cc4c4a3820e))
* **hooks:** add generic input type parameters for integration account hooks ([2bc910a](https://github.com/allthingslinux/portal/commit/2bc910a15552df7681ca16f6615254f713c6a681))
* Implement type-safe integration account creation and update using Zod schemas and branded types. ([4c176a1](https://github.com/allthingslinux/portal/commit/4c176a1c0a84deaf28d11a94ef6736e896d762bb))
* **integrations:** implement type-safe forms and schema-backed routing ([b3fe80d](https://github.com/allthingslinux/portal/commit/b3fe80d0b5fd6f2095b33e01593a999d45570dcf))
* Introduce new `react-hook-form-zod` and `zod` skills with various form templates and update integration schemas and documentation." ([c2eb2b9](https://github.com/allthingslinux/portal/commit/c2eb2b90fb060b207dadd15cdea0e79ae15ee7a9))
* **irc:** add account schema validation for IRC integration ([f982174](https://github.com/allthingslinux/portal/commit/f9821747ea34a54e67fac795494fbfc9f9517c95))
* **schemas:** centralize user and admin validation schemas ([b2f9e69](https://github.com/allthingslinux/portal/commit/b2f9e6943d3233e81f25d4492a3d5d42f30b7356))
* **types.ts:** add Zod schema types for account creation and update ([58b0326](https://github.com/allthingslinux/portal/commit/58b032699a6289f68b00f83116430ae7d2665ea0))
* **utils.ts:** add brandedString helper function for creating branded string schemas ([50450da](https://github.com/allthingslinux/portal/commit/50450dae3a7fa4552d50e347361b13fd9b5324bd))
* **xmpp:** add CreateXmppAccountRequestSchema to XmppIntegration ([c399216](https://github.com/allthingslinux/portal/commit/c399216431b86f0b2fe6da92192c03b69c89ed24))

# [1.3.0](https://github.com/allthingslinux/portal/compare/v1.2.0...v1.3.0) (2026-02-01)


### Bug Fixes

* **admin-hooks:** enhance user fetching logic and type safety ([2d9dea7](https://github.com/allthingslinux/portal/commit/2d9dea759ca216baed17ae4b32221d40c4d590b5))
* **admin-suspense:** ensure correct type casting for user detail updates ([646d1c2](https://github.com/allthingslinux/portal/commit/646d1c2fdefa3606168941b6b7bd156a190ccfed))
* **admin-suspense:** prevent incomplete cache entries during user updates ([7d2bec0](https://github.com/allthingslinux/portal/commit/7d2bec0e617145e4cae97fd4fc54e6b6532e4c8f))
* **admin:** refine user detail cache merging logic to prevent incomplete entries ([146d490](https://github.com/allthingslinux/portal/commit/146d49061d92035f2978f0eb0ac34b92a091d5cc))
* **api:** update date types in account interfaces to ISO-8601 strings ([a8d263c](https://github.com/allthingslinux/portal/commit/a8d263c800102bb473a0f58b13c655656d8241d6))
* **auth/config.ts:** add condition to check active status of IRC account ([2cbee95](https://github.com/allthingslinux/portal/commit/2cbee951a4a30178f9107415df026aa6a26b4c78))
* **integration-management:** update Sentry error handling and variable naming ([68e7fa3](https://github.com/allthingslinux/portal/commit/68e7fa34caa9461066ad59f0e79566b3313ef782))
* **integrations:** address review actionable and nitpick comments (identified by cubic) ([18e7f90](https://github.com/allthingslinux/portal/commit/18e7f90341c68e815299f817f89be23f389dd7a3))
* **integrations:** align TypeScript update request types with Zod validation (identified by cubic) ([527f364](https://github.com/allthingslinux/portal/commit/527f36443aabd96cac573a263b13da7ddb5352b6))
* **integrations:** enforce dedicated deletion method by excluding 'deleted' status from update schemas (identified by cubic) ([c028855](https://github.com/allthingslinux/portal/commit/c028855cba76d98cf98908858b752283b28ad1e8))
* **integrations:** enforce strict request interfaces and improve fault code safety (identified by cubic) ([8adffaa](https://github.com/allthingslinux/portal/commit/8adffaade8d20b5cbc664e179830ad57ad5147cc))
* **integrations:** improve clipboard copy functionality with Sentry error tracking ([9397d5a](https://github.com/allthingslinux/portal/commit/9397d5a54da2201b9df8204ba05564dd7e2aba60))
* **integrations:** resolve lint and type errors in auth config and irc implementation ([02ac1ec](https://github.com/allthingslinux/portal/commit/02ac1ec9ea5e9bc85278182f02972933095bb17e))
* **irc:** clarify IRC nick validation documentation ([96a8674](https://github.com/allthingslinux/portal/commit/96a867479ad6fbb38de0068c6ca48bdf9f9ab096))
* **irc:** correct TLS verification in atheme/unreal clients and add undici dependency ([84a3695](https://github.com/allthingslinux/portal/commit/84a36950428f17d632e402792dfbfa122cfb9012))
* **irc:** enhance error handling for user and channel list retrieval ([d807149](https://github.com/allthingslinux/portal/commit/d807149a30b3ae024a6a6644969609eb7f937328))
* **irc:** enhance error handling in Atheme command processing ([7e4d090](https://github.com/allthingslinux/portal/commit/7e4d090d5560d81df3a103ffb5ec41bff599d5c0))
* **irc:** enhance error handling with Sentry integration ([303ca9b](https://github.com/allthingslinux/portal/commit/303ca9b3657310ed4a0104ef41dc6d62ddf6f4ee))
* **irc:** enhance IRC nick validation tests ([31ae264](https://github.com/allthingslinux/portal/commit/31ae26404dde63ef016570e5c9a62c73310d622a))
* **irc:** implement Zod schema for IRC account creation and enhance error handling ([9efd47e](https://github.com/allthingslinux/portal/commit/9efd47ec1c4526832f86d1106658143e7d2f7d75))
* **irc:** improve error handling during IRC account creation ([bbecc44](https://github.com/allthingslinux/portal/commit/bbecc44a8d0b5a8999e4804c99aff335b0d16ce4))
* **irc:** integrate Sentry for registerNick function to enhance error tracking ([30443a3](https://github.com/allthingslinux/portal/commit/30443a337de0e6d7609beca7bd45e464b918d5c5))
* **irc:** refine IRC nick validation logic ([28eaa8b](https://github.com/allthingslinux/portal/commit/28eaa8b9da89d0562260807ff6c56e2e4f6955f4))
* **irc:** update date formatting in IRC accounts management ([e39fc93](https://github.com/allthingslinux/portal/commit/e39fc93f888f16cdd328484ddd57589f0badcf79))
* **irc:** update Sentry import and improve API URL normalization ([42242bc](https://github.com/allthingslinux/portal/commit/42242bc60a980b7072054707c4c65365b2307611))
* **sheet:** adjust close button positioning and accessibility ([2ba1f55](https://github.com/allthingslinux/portal/commit/2ba1f55d16e8e554838bff29bba87f8e6b64e0ea))
* **sidebar:** adjust sidebar icon width and enhance layout responsiveness ([ef389e2](https://github.com/allthingslinux/portal/commit/ef389e2753dbd415ccb16a7f5ecb4cd3829918ee))
* **user-detail:** prevent date display issues before component mounts ([63e11de](https://github.com/allthingslinux/portal/commit/63e11dec3d37ad53a559976c4bbc55f4fb53fc88))


### Features

* **admin:** add IRC accounts query hook for admin dashboard ([362f360](https://github.com/allthingslinux/portal/commit/362f360523a1d396c4467663134e03de9bcaf952))
* **admin:** add IRC accounts tab and management component to admin dashboard ([70adb68](https://github.com/allthingslinux/portal/commit/70adb68d9446b070d60303914aef3f1f459185f6))
* **admin:** add user detail sheet component for enhanced user information display ([b124981](https://github.com/allthingslinux/portal/commit/b124981be2dc5b776ea60c312a0e19d1e9f5449c))
* **admin:** enhance user columns with view details functionality ([73562a4](https://github.com/allthingslinux/portal/commit/73562a4a0ac658f249b924ee3bb52f6bce62fad5))
* **admin:** implement IRC accounts management component ([cde2a8d](https://github.com/allthingslinux/portal/commit/cde2a8db4f77626909e803062ca6d0f48974530d))
* **admin:** improve user update cache handling in useUpdateUserSuspense ([d7fa0c4](https://github.com/allthingslinux/portal/commit/d7fa0c489167cb194e6e765c1de04a8d8f0910b4))
* **admin:** integrate user detail viewing in user management ([3bb5268](https://github.com/allthingslinux/portal/commit/3bb52687f904ce2afada1201f20ea5c6edf8104f))
* **api:** add AdminUserRow type for user detail response ([9999bfd](https://github.com/allthingslinux/portal/commit/9999bfd457a0a6aa3c18857acc6c5ccab9d3b353))
* **api:** add new types for admin IRC and XMPP accounts ([5efb073](https://github.com/allthingslinux/portal/commit/5efb0735157c3434d4e09f4512ac74b94dcb9ede))
* **api:** enhance IRC accounts retrieval with pagination and status filtering ([d22505b](https://github.com/allthingslinux/portal/commit/d22505b919c885a096892c76027989e9a531c834))
* **api:** enhance user and IRC account management APIs ([270d5d8](https://github.com/allthingslinux/portal/commit/270d5d86fae7fde0f1fd433e409401dccf90c76d))
* **api:** enhance user GET route to include IRC and XMPP account details ([d7b643f](https://github.com/allthingslinux/portal/commit/d7b643f53398f7ba1b84739fe1cd5254e42d59fb))
* **api:** extend type exports for admin functionality ([24e2a57](https://github.com/allthingslinux/portal/commit/24e2a573a164088ee308a0d549c54895d1219a8f))
* **auth:** add IRC scope support and claims retrieval ([d9ee67b](https://github.com/allthingslinux/portal/commit/d9ee67b9b06ec35eb2bb6aae66c535dd5edb13c0))
* **constants.ts:** add 'Pending' status to integrationStatusLabels ([40c173e](https://github.com/allthingslinux/portal/commit/40c173e995359172400fd76ae8769f37dcfdc3b0))
* **constants.ts:** add "pending" status to INTEGRATION_STATUSES ([0e6e779](https://github.com/allthingslinux/portal/commit/0e6e779aee0542822906d9225c0d3f542aafb2e9))
* **docs:** add IRC integration documentation ([6927ba7](https://github.com/allthingslinux/portal/commit/6927ba733226e02e08107c23b11d6160fcacc306))
* **env:** include IRC keys in environment configuration ([a355f0c](https://github.com/allthingslinux/portal/commit/a355f0c9e908ffb012f85fe20adf52c326ea42d6))
* **integrations:** add IRC password dialog and enhance integration management ([eeae9f9](https://github.com/allthingslinux/portal/commit/eeae9f959ff207a5081fa1a0721c9d0efeda80dd))
* **integrations:** enhance clipboard copy functionality and update IRC nick length display ([fae166d](https://github.com/allthingslinux/portal/commit/fae166d8dd377a5e2169fcafd4e4753e43f8bd57))
* **integrations:** enhance integration management with required input and success callback ([3290a04](https://github.com/allthingslinux/portal/commit/3290a04c435a28f8ebfd128ef9ce6519ba3b8004))
* **integrations:** irc ([e75297d](https://github.com/allthingslinux/portal/commit/e75297dd31940cbca673d63a66d39d569f30664d))
* **integrations:** refine account lifecycle, status filtering, and validation for IRC and XMPP ([dbf58c2](https://github.com/allthingslinux/portal/commit/dbf58c28300b7ebad7e81e4350ea693c691f3845))
* **irc:** add environment variable configuration for IRC integration ([65bc83e](https://github.com/allthingslinux/portal/commit/65bc83ea3e50284b6aa1fe43314585d5b551fd07))
* **irc:** add IRC account schema definition ([7edaf94](https://github.com/allthingslinux/portal/commit/7edaf94dd2aaf4aaedecf46ec839abfcc48d8140))
* **irc:** add IRC accounts query keys for admin functionality ([fa3b60a](https://github.com/allthingslinux/portal/commit/fa3b60a4825ace8a3fa85bb285aa889a4be9edb7))
* **irc:** add IRC configuration and provisioning check ([47e878b](https://github.com/allthingslinux/portal/commit/47e878bffde8c190800b0c454e0a6e54386c0a5a))
* **irc:** add IRC utility functions for nickname validation and password generation ([0df1543](https://github.com/allthingslinux/portal/commit/0df15433fc5f8b2599f34ea2572cd6977ea7e7ee))
* **irc:** add option to skip SSL verification for Atheme client ([bf50264](https://github.com/allthingslinux/portal/commit/bf502640c7febecd9faa1f11033ed555e01df0ac))
* **irc:** add option to skip SSL verification for Unreal IRC integration ([811274b](https://github.com/allthingslinux/portal/commit/811274bf777b56a8d6ac722b3aecb8d43c6c8718))
* **irc:** add UnrealIRCd configuration and validation functions ([ec2b4da](https://github.com/allthingslinux/portal/commit/ec2b4dadd507deb7bf7912920498777a1ed86a25))
* **irc:** add UnrealIRCd JSON-RPC response types ([dda0f8e](https://github.com/allthingslinux/portal/commit/dda0f8e67b6fcb3e9c693d105820eb7bb3f28bb8))
* **irc:** create public API for IRC integration ([436a432](https://github.com/allthingslinux/portal/commit/436a4329ad30bfc8ea98f218b6b9797c4871d45f))
* **irc:** define types for IRC account management and Atheme JSON-RPC ([ad2a24f](https://github.com/allthingslinux/portal/commit/ad2a24faa874f45da547fd0600fcbdb5a7a26a5b))
* **irc:** extend IRC module with UnrealIRCd types and client exports ([7cb4d97](https://github.com/allthingslinux/portal/commit/7cb4d97d4fa01e3303e05332bc3f584db379ebbe))
* **irc:** implement Atheme JSON-RPC client for IRC commands ([9ae299c](https://github.com/allthingslinux/portal/commit/9ae299c448c755f49a6757fe8398e0b667cc8ede))
* **irc:** implement GET route for fetching IRC accounts ([bfd045a](https://github.com/allthingslinux/portal/commit/bfd045ae5ef0aa3f283ee6ae0fa41e0272816631))
* **irc:** implement IRC integration for account management ([8387268](https://github.com/allthingslinux/portal/commit/838726868e23820bbe31a7f2e40b8dc9785b764a))
* **irc:** implement UnrealIRCd JSON-RPC client for admin functionalities ([9665dbb](https://github.com/allthingslinux/portal/commit/9665dbb9b3a45fea51e7584be2a4c1726b7e860d))
* **irc:** include ircAccount in the main schema export ([67ec2a3](https://github.com/allthingslinux/portal/commit/67ec2a3a2d3d65d9a555ea9300d32770a1920849))
* **irc:** register IRC integration in the main integration module ([51e4826](https://github.com/allthingslinux/portal/commit/51e482683c7d44c56e4c6c06e06a64c2283325dd))
* **irc:** update IRC environment variables for UnrealIRCd integration ([4c4437e](https://github.com/allthingslinux/portal/commit/4c4437e4856fd0e17504625875eccbae58f6b151))
* **migration:** add SQL migration to drop redundant indexes and create snapshot ([7b733a8](https://github.com/allthingslinux/portal/commit/7b733a8eb2afc2a12132a50360c169ee7ad64374))
* replace direct unique constraint on `userId` with a partial unique index for active IRC accounts. ([62f9982](https://github.com/allthingslinux/portal/commit/62f9982726262fa75b3e563c0273a4a93240f0ee))
* **schema:** add 'pending' status to ircAccountStatusEnum ([cf1f4ca](https://github.com/allthingslinux/portal/commit/cf1f4ca5a0da3c74b629690a4e846dd917d02310))
* **types.ts:** add "pending" status to IrcAccountStatus type ([976347c](https://github.com/allthingslinux/portal/commit/976347c9aa06df2b2ccd1c535b8292968d82089d))

# [1.2.0](https://github.com/allthingslinux/portal/compare/v1.1.0...v1.2.0) (2026-01-30)


### Bug Fixes

* **deps:** update dependency next to v16.1.5 [security] ([e821803](https://github.com/allthingslinux/portal/commit/e82180395b87b4c44ab4a9140024f9234b115c94))
* **instrumentation:** optimize Sentry integration for production ([38dd8ee](https://github.com/allthingslinux/portal/commit/38dd8ee857b9e7f33138053ea15120270705c403))
* **next.config:** disable CSS chunking as a workaround for Turbopack issue in development ([cb5309f](https://github.com/allthingslinux/portal/commit/cb5309f9ca4c58344b0355c32ced714c66782a55))


### Features

* **admin:** enhance user management with improved filters and query options ([79a1381](https://github.com/allthingslinux/portal/commit/79a13811c68c85f7241c9544d0676b8ea76347bd))
* **admin:** enhance user management with URL state and filters ([3afb4e6](https://github.com/allthingslinux/portal/commit/3afb4e627e5385ab41f97dfe5bfcb0bcd910f8d4))
* **api:** add route ID validation and parsing utility ([7deb7c9](https://github.com/allthingslinux/portal/commit/7deb7c9adc40d773beb2f9d6c5d932c6fbdce7ed))
* **config:** enable component caching and enhance security features ([54d941e](https://github.com/allthingslinux/portal/commit/54d941edd75dacefb3b354c2519981d968417af0))
* **error:** create dedicated AppError component and lazy-load error boundary ([b4f316d](https://github.com/allthingslinux/portal/commit/b4f316de7875e6a46ba9e7f5f78c2fb87e9b5215))
* **error:** implement lazy-loaded error boundary component ([6067afd](https://github.com/allthingslinux/portal/commit/6067afd5c32872a8d4b1c44a01cf9e8237efde7b))
* **hooks:** add useDebouncedValue hook for improved input handling ([327f0d2](https://github.com/allthingslinux/portal/commit/327f0d21a5cfd096ba2b64f73170026b317e5d0b))
* **layout:** implement Suspense for loading state and establish connection in RootLayout ([d481bea](https://github.com/allthingslinux/portal/commit/d481bea3f9687aeaa94b51e0721920ba327f7bf3))
* **loading:** add loading UI component for root segment ([ab4c740](https://github.com/allthingslinux/portal/commit/ab4c7405522cdbb9b5de25c53de0b0c3f075bf34))
* **not-found:** establish connection in NotFound component ([d77efe3](https://github.com/allthingslinux/portal/commit/d77efe34c3ee03166f64970df4c40fe7490b42e4))
* **page:** establish connection in metadata generation and page rendering ([f92fa77](https://github.com/allthingslinux/portal/commit/f92fa77a929ac7f255b02220526448cdcbe78856))
* **providers:** implement lazy-loaded Sentry initialization and refactor Providers component ([c49f85f](https://github.com/allthingslinux/portal/commit/c49f85f6530079e1dff8109d67510121798f81ee))
* **settings:** enhance account settings configuration with custom paths and layout options ([ad2e83e](https://github.com/allthingslinux/portal/commit/ad2e83e039ffaef7164f1c2b7c16809fc3f61994))
* **settings:** implement nuqs-based tab state management for settings page ([f80a7ce](https://github.com/allthingslinux/portal/commit/f80a7ced217b932142deaef9c79ec3d3f3b93fe2))

# [1.1.0](https://github.com/allthingslinux/portal/compare/v1.0.1...v1.1.0) (2026-01-27)


### Features

* **auth:** implement script-only auth and db modules for admin user creation ([8780248](https://github.com/allthingslinux/portal/commit/87802486dc45f24459fec4a886b4100d0a43b5a7))

## [1.0.1](https://github.com/allthingslinux/portal/compare/v1.0.0...v1.0.1) (2026-01-27)


### Bug Fixes

* **db:** update PostgreSQL volume mount path in Docker Compose configuration ([638ef42](https://github.com/allthingslinux/portal/commit/638ef42041db7a0fc7d9fb6ed86619dfab71b3ea))

# 1.0.0 (2026-01-27)


### Bug Fixes

* **api:** enhance error handling to prevent internal detail exposure ([892b8fb](https://github.com/allthingslinux/portal/commit/892b8fb72f6298ca7fe4ce8938acb292e5d50a6f))
* **api:** standardize error responses for not found cases ([751656f](https://github.com/allthingslinux/portal/commit/751656f0d908464b8ad60254435afec03d26a6ff))
* **auth:** update BETTER_AUTH_URL validation to use z.url() for improved type safety ([d8c0f38](https://github.com/allthingslinux/portal/commit/d8c0f387bef412c0834930d76272209d979bf005))
* **auth:** update terms and privacy links to external URLs ([0fdadde](https://github.com/allthingslinux/portal/commit/0fdadde3fa65b5746d3630c0e889637e5ccd5e50))
* **cache:** correct cache hit determination and enhance cache configuration documentation ([80cec38](https://github.com/allthingslinux/portal/commit/80cec381f7ae4dd21522c76f096ffec7b4b3710a))
* **components:** update UserButton size for improved UI consistency ([b039ac8](https://github.com/allthingslinux/portal/commit/b039ac832cdb68373ca2d062c4960765a3eebcd9))
* **db:** update DATABASE_URL validation to use z.url() for improved type safety ([901698c](https://github.com/allthingslinux/portal/commit/901698c33d64e1b53d85e4371de538b9ced55185))
* **env:** update XMPP keys import path ([e1f9e70](https://github.com/allthingslinux/portal/commit/e1f9e706090af0592183c6f777760b8dd8c59250))
* **error handling:** clean up error and not-found components for better readability ([f618a3b](https://github.com/allthingslinux/portal/commit/f618a3baabcb5ab69c1794444597728ff7f7e1d7))
* **error-handling:** improve Sentry error logging with fallback mechanism ([048c614](https://github.com/allthingslinux/portal/commit/048c614aab3855634f5423b273cc99b870bd966c))
* **error:** restore useTranslations import in error.tsx ([0b8be9c](https://github.com/allthingslinux/portal/commit/0b8be9c9fb15c2018c5c5a444ec776ba910f6733))
* **global-error:** restore useTranslations import in global-error.tsx ([e629cfd](https://github.com/allthingslinux/portal/commit/e629cfdd9b8c5bf94528adbe140aecca340d14c5))
* **hooks:** clean up whitespace and reorganize imports in use-permissions and use-user-suspense hooks ([916e3a9](https://github.com/allthingslinux/portal/commit/916e3a95095e48702f0f02fc0936e70d4a4351e3))
* **navigation:** enhance type safety in router path handling ([364804a](https://github.com/allthingslinux/portal/commit/364804a82aa28ef45204f8a113381a81b9ee6674))
* **navigation:** update Link href type casting for improved type safety ([4940b15](https://github.com/allthingslinux/portal/commit/4940b15b43576a5b8056ecf4d1fded9a060bb8bd))
* **observability:** add fallback for Sentry release version to "unknown" ([47d2506](https://github.com/allthingslinux/portal/commit/47d2506a4ab4c97ceaee9e00d0908d0835343acc))
* **observability:** ensure error message is a string before returning ([c8a59f9](https://github.com/allthingslinux/portal/commit/c8a59f9c034f9d7c68cce35cd0137b74f68b46fc))
* **observability:** simplify hostname retrieval for portal tags ([c51b9f9](https://github.com/allthingslinux/portal/commit/c51b9f9e1e280f5fd93f198cda6d7795d4073bac))
* **observability:** update Sentry configuration for improved handling and compatibility ([3eaab1d](https://github.com/allthingslinux/portal/commit/3eaab1d86f6d8bc79c30df3d0d01536c553638ab))
* **seo:** correct type attribute placement in JsonLd component ([088c5a8](https://github.com/allthingslinux/portal/commit/088c5a8f025d501e2cfd7c54241e471c84db9304))


### Features

* **admin:** implement admin API client and dashboard components ([f9b4468](https://github.com/allthingslinux/portal/commit/f9b446837fca4701e76eed253ab61121ea1fd649))
* **admin:** implement loading skeletons for user, session, and admin management ([71069cd](https://github.com/allthingslinux/portal/commit/71069cdd95bb14c885457b214708bc08a58b39dc))
* **api:** add comprehensive admin and user API client functions ([c816952](https://github.com/allthingslinux/portal/commit/c8169527f3efe800016f539c3cc450a12818afef))
* **api:** add server-only imports and enhance error handling with observability utilities ([349e9d0](https://github.com/allthingslinux/portal/commit/349e9d003f08a42c8b070f931c8f70270b11812d))
* **api:** introduce hydration utilities and server-side query functions ([4ecc921](https://github.com/allthingslinux/portal/commit/4ecc921249ff7bed8e5e3d54759a666c20931553))
* **auth:** add user deletion integration cleanup ([d6cbbb6](https://github.com/allthingslinux/portal/commit/d6cbbb62183f25fa36359701052ee07fd9b510a5))
* **auth:** enhance OAuth configuration to support XMPP scope ([23cb8dc](https://github.com/allthingslinux/portal/commit/23cb8dc7af60d7dfd536e911a0bb76a536434355))
* **auth:** implement server-only imports and environment variable management ([92ce6da](https://github.com/allthingslinux/portal/commit/92ce6da45536cb513a5a7d46f497ca6c225f1fca))
* **breadcrumbs:** add centralized breadcrumb generation for improved navigation ([fa3b3d0](https://github.com/allthingslinux/portal/commit/fa3b3d00709621597d8d733591a6458aaa48a205))
* **breadcrumbs:** implement breadcrumb generation and merging functionality ([4a9384c](https://github.com/allthingslinux/portal/commit/4a9384c5ace06d4a2f0ec737e6ed6abab88284e6))
* **components:** add global command menu for quick navigation ([b1de3fa](https://github.com/allthingslinux/portal/commit/b1de3fa9d5dcb855720fc392f38719683f567881))
* **config:** add commitlint configuration for standardized commit messages ([5e96698](https://github.com/allthingslinux/portal/commit/5e966981d9a5d72e7d1f35d5b66523bae83d9e12))
* **config:** add Renovate configuration for automated dependency management ([7bda937](https://github.com/allthingslinux/portal/commit/7bda937c832ebf0055390baa66249ff15547734d))
* **config:** add server external packages configuration ([9be3d5b](https://github.com/allthingslinux/portal/commit/9be3d5bbd09418225e9dee3f8f68051b4e2fe12c))
* **config:** enable standalone output for Docker deployments ([ae6d4ef](https://github.com/allthingslinux/portal/commit/ae6d4efca54db49dfa25d82fbb5fc1ff0dd93871))
* **config:** enhance Next.js configuration with comprehensive settings and optimizations ([0be31a8](https://github.com/allthingslinux/portal/commit/0be31a88a5ed3d9a22ac7406ca0b054ec60675c4))
* **container:** add multi-stage Containerfile for Next.js 16 application ([de8d260](https://github.com/allthingslinux/portal/commit/de8d260f796b52021e33ab56572c0256429cbb40))
* **dal:** implement centralized data access layer for session verification and role management ([b215729](https://github.com/allthingslinux/portal/commit/b215729a851a7b684d93697467a2a425d79dd9f2))
* **dashboard:** enhance loading states and error handling across dashboard components ([7e6dd46](https://github.com/allthingslinux/portal/commit/7e6dd46e6642e8316c13410aaf236e00f5161215))
* **dashboard:** implement loading, error, and not found components for dashboard and admin sections ([0178678](https://github.com/allthingslinux/portal/commit/0178678a71565e0d9d5accf234fb8bf5c526173f))
* **db:** implement environment variable management for database connection ([d3dd3d0](https://github.com/allthingslinux/portal/commit/d3dd3d05562193ebf44b4d303d93845cc43e6688))
* **dependencies:** add new packages for enhanced functionality and error handling ([27b6a84](https://github.com/allthingslinux/portal/commit/27b6a841ce415578feb2473aa7fa8ca5f1b1eb0d))
* **dependencies:** add next-intl for enhanced internationalization support ([54ab834](https://github.com/allthingslinux/portal/commit/54ab834b04cb8087a503753108a3e0c510fac4f1))
* **dependencies:** update package versions and add testing scripts ([7dcb435](https://github.com/allthingslinux/portal/commit/7dcb4356801151338f7fe5293f5653ddc100ece1))
* **dependencies:** update package.json and pnpm-lock.yaml with new dependencies ([52196a5](https://github.com/allthingslinux/portal/commit/52196a54e384308029626aae532ab366b9c12b6b))
* **deployment:** add deployment, migration, and rollback scripts with CI/CD workflows ([231bc52](https://github.com/allthingslinux/portal/commit/231bc52970e8d725978206bae249ccf5677f5932))
* **docker:** add .dockerignore file to exclude unnecessary files from Docker context ([d69f95d](https://github.com/allthingslinux/portal/commit/d69f95d4fb452da06bce740960f8d1563297f7bf))
* **docker:** add Docker Compose configurations for production and staging environments ([5000390](https://github.com/allthingslinux/portal/commit/500039080af671df6a46ae19560d7749a9ed042c))
* **docs:** add comprehensive documentation for accessibility, API, architecture, CI/CD, components, deployment, and testing ([d3efd9a](https://github.com/allthingslinux/portal/commit/d3efd9a397575ed3898fe0a710661541f5625fe8))
* **docs:** add contributing guidelines for Portal project ([1a86e10](https://github.com/allthingslinux/portal/commit/1a86e10435ff5c062beef124e701c34897eab8e7))
* **docs:** enhance README with testing, architecture, and operational guidelines ([763d1f5](https://github.com/allthingslinux/portal/commit/763d1f5868af79fbb5c7fc781d27fa48be0e8b48))
* **env:** create environment configuration for server and client ([54b12ee](https://github.com/allthingslinux/portal/commit/54b12ee7751f7049e839d38b4038b2780fa30f31))
* **error-handling:** implement global error boundaries and metadata management ([4f99da9](https://github.com/allthingslinux/portal/commit/4f99da9a6f22e19cb81bdf10ef13204c391f737d))
* **hooks:** add comprehensive hooks for admin and user management ([63fbe6c](https://github.com/allthingslinux/portal/commit/63fbe6cc6531a547d5d63cacb84606eeaa44b2c0))
* **i18n:** add route translation utilities for enhanced localization ([b5ceb39](https://github.com/allthingslinux/portal/commit/b5ceb39c0b1054d8f126d7069fbb028f2a42a9e2))
* **i18n:** add server-side translation resolver for route configuration ([587456a](https://github.com/allthingslinux/portal/commit/587456a6ea49196f4dd68e535e290eb18cb5b87f))
* **i18n:** enhance AdminDashboard with localized titles and descriptions ([769dad7](https://github.com/allthingslinux/portal/commit/769dad75404c9ba08245f74fb407a036919a764c))
* **i18n:** enhance AppHeader with localized breadcrumbs ([491d964](https://github.com/allthingslinux/portal/commit/491d9641df913c1f924568eae9bf7e95adb90ab8))
* **i18n:** enhance authentication page localization ([1d3e5d2](https://github.com/allthingslinux/portal/commit/1d3e5d278a3fcb1837a895938abf16ab990927ce))
* **i18n:** enhance error component localization ([e2a99eb](https://github.com/allthingslinux/portal/commit/e2a99eb735d81ad43804b34aa16ea948d508fc79))
* **i18n:** implement locale message loading and configuration ([39a0c1d](https://github.com/allthingslinux/portal/commit/39a0c1d31a9b6e2ae576f417c5a4aaabb1ae44e9))
* **i18n:** integrate localization into error and not found pages ([19df3d4](https://github.com/allthingslinux/portal/commit/19df3d44431dbf067d36fa6ccbc94a6afd5dd777))
* **i18n:** integrate localization into RootLayout component ([def9fd2](https://github.com/allthingslinux/portal/commit/def9fd2390c66d2d57d1e06a00f0409798522d9c))
* **i18n:** integrate next-intl plugin for improved internationalization support ([7335b4d](https://github.com/allthingslinux/portal/commit/7335b4de7ffaa36f3bfe2a67bc21ceddc0b86704))
* **i18n:** localize error messages in GlobalError component ([4fed7bc](https://github.com/allthingslinux/portal/commit/4fed7bcf7251d04d05d9f63b5dde3327c1445bda))
* **i18n:** localize home page content and metadata ([f38329d](https://github.com/allthingslinux/portal/commit/f38329def42a3ba459dea96791ed3345cdd15ba2))
* **i18n:** localize NotFound component messages ([b04d00a](https://github.com/allthingslinux/portal/commit/b04d00ab2a88e83da02b90adb363b32a0957fb9c))
* **instrumentation:** add Next.js instrumentation for observability integration ([bf293da](https://github.com/allthingslinux/portal/commit/bf293da8f811bf12481804667b2ca19b3fd390b1))
* **integrations:** add integration account management API routes ([917e304](https://github.com/allthingslinux/portal/commit/917e3041d07c2f5fffe6d9a25cb4c92e25999290))
* **integrations:** add integration accounts schema and migration ([a1fc070](https://github.com/allthingslinux/portal/commit/a1fc07034d24c634ae0c9cc1c2ae583cdf9731a4))
* **integrations:** add integration API module and query keys ([1c4b6a4](https://github.com/allthingslinux/portal/commit/1c4b6a4099eb2a6c227a21288fb81bb4ae45de55))
* **integrations:** add integration card and management components ([36b3294](https://github.com/allthingslinux/portal/commit/36b32940f35c3794c4b241a6df189602b78ad751))
* **integrations:** add integration hooks for account management ([777ceb9](https://github.com/allthingslinux/portal/commit/777ceb9bd843b0e6dfa7329479af5b8b7324a4ec))
* **integrations:** add integration registration function ([e981972](https://github.com/allthingslinux/portal/commit/e9819729783bf02267cec368fac1fbf505672ab5))
* **integrations:** add integrations content and page components ([e090091](https://github.com/allthingslinux/portal/commit/e0900917e6100c1806e71582c75a3131928f695d))
* **integrations:** add integrations framework documentation ([97c374e](https://github.com/allthingslinux/portal/commit/97c374e5658a70c20ded7d3ad77641962c871ece))
* **integrations:** enhance integration management and error handling ([d62f989](https://github.com/allthingslinux/portal/commit/d62f989739bdd221c523a9448ac372fed18c7070))
* **integrations:** implement core integration framework ([25d3489](https://github.com/allthingslinux/portal/commit/25d348941d5519ba9d2a2319bd9efa3f3cf39d3d))
* **layout:** introduce dynamic app header and breadcrumb context for improved navigation ([a4183b4](https://github.com/allthingslinux/portal/commit/a4183b48689aff60c2e5ac8850032018ab1ba2a0))
* **lint:** add lint-staged configuration for TypeScript and JSON files ([24f0eab](https://github.com/allthingslinux/portal/commit/24f0eab9b569be0b558fef3909288d9a33518159))
* **localization:** add initial localization files for English ([829fb9b](https://github.com/allthingslinux/portal/commit/829fb9bd16c4a2267958ef67dca845e2c1cf48e6))
* **localization:** enhance internationalization support with new localization hook and updated locale files ([2b573f6](https://github.com/allthingslinux/portal/commit/2b573f688b11b0041d835cb6a27e4cbb9439fedd))
* **logging:** implement wide events pattern for structured logging ([5b12d1a](https://github.com/allthingslinux/portal/commit/5b12d1a1acec3be5a30a3b1b429ad4048119dd9b))
* **mcp:** add Next.js Devtools MCP commands and create TanStack Query guide ([5151e1b](https://github.com/allthingslinux/portal/commit/5151e1b845a3535025fa24ad075eb7496d0e5af9))
* **mcp:** add Sentry URL configuration for monitoring ([64e22cf](https://github.com/allthingslinux/portal/commit/64e22cfbc0b22c2bcbccbbc1f54dfc184d87353e))
* **monitoring:** implement Sentry tunnel route for event forwarding ([7c2691c](https://github.com/allthingslinux/portal/commit/7c2691c51e1bf2441e7d2ee2c8fe6430027a06ef))
* **next-config:** add Next.js configuration files for image formats and observability ([e566a49](https://github.com/allthingslinux/portal/commit/e566a49c8e85c5f7e691b3b14ff9053c69ca659a))
* **next-config:** enhance Next.js configuration with CSP reporting and observability ([ba96b2f](https://github.com/allthingslinux/portal/commit/ba96b2f4927fc601e8967649e7714a3531f951c4))
* **next.config:** enhance development optimizations and logging configuration ([9fc9fd1](https://github.com/allthingslinux/portal/commit/9fc9fd18ca432e7fb52326a81707743153fd53f5))
* **oauth:** add script to create Prosody OAuth client ([ad50012](https://github.com/allthingslinux/portal/commit/ad500126657de386e699503771179d3959bb0a79))
* **observability:** add environment variable validation for observability configuration ([c340b8e](https://github.com/allthingslinux/portal/commit/c340b8ebdbf26384e83461dd19ef8bb92b7a034e))
* **observability:** add request body size calculation and enhance HTTP client documentation ([f54f96d](https://github.com/allthingslinux/portal/commit/f54f96d5a6611c4a5ba8eb41572d48f21ca5ac39))
* **observability:** implement comprehensive observability utilities for enhanced monitoring ([c6ae811](https://github.com/allthingslinux/portal/commit/c6ae811967516d2fd12bc76c9670f6b5316537ec))
* **observability:** update Sentry tunnel route for improved request handling ([ac04cde](https://github.com/allthingslinux/portal/commit/ac04cde964c8b37c172af915d7ceea4c0b97b8fb))
* **permissions:** implement user permissions management for route access ([fc40db8](https://github.com/allthingslinux/portal/commit/fc40db8feb196c9f94e48ef292636e69e051247d))
* **plans:** add comprehensive plan to address PR[#1](https://github.com/allthingslinux/portal/issues/1) review issues ([ab1b397](https://github.com/allthingslinux/portal/commit/ab1b397b1d3e319e80b9263b3f332e77bd93426b))
* **providers:** enhance Better Auth UI compatibility and add development tools ([b2bb6d1](https://github.com/allthingslinux/portal/commit/b2bb6d1d45810d90fca6b33a5917a9e327d7500e))
* **proxy:** update matcher to exclude Sentry tunnel route from /app paths ([f679d06](https://github.com/allthingslinux/portal/commit/f679d06e87dc52b758d34e462f00de80a3a5116c))
* **query-client:** remove query client utility file ([ce50e8c](https://github.com/allthingslinux/portal/commit/ce50e8c66bbf59bf917795f47b0c8889fe496976))
* **release:** add semantic release configuration for automated versioning and changelog generation ([236c0ff](https://github.com/allthingslinux/portal/commit/236c0ff956dbbed28e25fc13bb1750741589bbc6))
* **routes:** add comprehensive documentation for navigation i18n integration ([cc68fca](https://github.com/allthingslinux/portal/commit/cc68fca5d55cc6bfcc71301a53460ece01ed9f0d))
* **routes:** add route configuration for public and protected routes ([1c09420](https://github.com/allthingslinux/portal/commit/1c09420fe686862d9c209aeb6a5b972e407708ed))
* **routes:** add useTranslatedRoutes hook for automatic route translation ([1948d21](https://github.com/allthingslinux/portal/commit/1948d21fcc32d709445df4ce413ebbf7a1434c1c))
* **routes:** add XMPP route configuration ([40da294](https://github.com/allthingslinux/portal/commit/40da294237fa1c20189e14df4fa5cbe3b0606d17))
* **routes:** create core routing configuration file ([935622e](https://github.com/allthingslinux/portal/commit/935622e282d32567c520a4491f390c69b89bf048))
* **routes:** define route types and configurations ([880c66a](https://github.com/allthingslinux/portal/commit/880c66af7d5840f1cd178c7fc1fbb1da2383b395))
* **routes:** enhance integration route management ([aaef19f](https://github.com/allthingslinux/portal/commit/aaef19fd5bcb3d8547b13d46719ad0be0fc2ef83))
* **routes:** implement UI display retrieval for routes ([fee6b20](https://github.com/allthingslinux/portal/commit/fee6b20f92f53dc2bdb0bed57787b966c685ca99))
* **scripts:** enhance package.json with additional development and build scripts ([f81144d](https://github.com/allthingslinux/portal/commit/f81144da331f6d8ddae9813a0ea00fbc7454a17d))
* **security:** add CSP nonce retrieval function ([98b94b9](https://github.com/allthingslinux/portal/commit/98b94b92ff3128590407c4d185f3235cbb7c347c))
* **security:** implement CSP nonce generation and integration ([6999cf8](https://github.com/allthingslinux/portal/commit/6999cf8c57d1e019519c7ab2e977fa682d316a06))
* **sentry:** add Sentry configuration for Edge and server environments ([07e2781](https://github.com/allthingslinux/portal/commit/07e2781ec11b664e279e7e4576e39e75a7d0f918))
* **sentry:** integrate Sentry for error logging and tracing ([243e3d9](https://github.com/allthingslinux/portal/commit/243e3d9f01b690f6ee13a29ce8a91876743d3b3d))
* **seo:** add default metadata configuration and helper functions for SEO ([505e2f7](https://github.com/allthingslinux/portal/commit/505e2f78644d274737d68b2db21de1d2740d9e5d))
* **seo:** add JsonLd component for structured data and enhance metadata merging ([9e06171](https://github.com/allthingslinux/portal/commit/9e061715a3e41508b1c24b687737b54875565eaa))
* **seo:** add SEO utilities for page metadata, robots, and sitemap generation ([fdec692](https://github.com/allthingslinux/portal/commit/fdec6926cf90da820021760918e3e47804206abf))
* **seo:** implement robots.txt generation for SEO optimization ([f894369](https://github.com/allthingslinux/portal/commit/f8943693ca15d772bf5926f05e05626b0abff291))
* **seo:** implement sitemap generation for improved SEO ([bde3ee0](https://github.com/allthingslinux/portal/commit/bde3ee0bf6c5c9f132610f162fb4df2b5de910c7))
* **seo:** integrate CSP nonce into JSON-LD script generation ([f5a5f91](https://github.com/allthingslinux/portal/commit/f5a5f9155d47cb367c1bd81f3645052d42b502f2))
* **settings:** add loading skeleton components for account, security, and API keys ([f7b3365](https://github.com/allthingslinux/portal/commit/f7b33658cc69b4143350a629d51f1addf9096e21))
* **skills:** add new skills and resources for various development practices ([443f4ea](https://github.com/allthingslinux/portal/commit/443f4ea8fecd5dbb77fa5780673c18a724c006e6))
* **svg:** add multiple SVG icons for enhanced UI elements ([8a7575d](https://github.com/allthingslinux/portal/commit/8a7575d92ca094ed6517ee3df012169dd30c68a8))
* **tables:** integrate TanStack Table for session and user management ([97359f3](https://github.com/allthingslinux/portal/commit/97359f348691419d28bb61994802a72101efa981))
* **tests:** add comprehensive test coverage for user API, hooks, and utility functions ([26dace5](https://github.com/allthingslinux/portal/commit/26dace573be7b5df90a2fbc4f82eaf2289c24d80))
* **tests:** add Vitest configuration and setup for testing environment ([5d588da](https://github.com/allthingslinux/portal/commit/5d588dad30ea633128bdca3f42584168bfbaed60))
* **types:** add API and common types for improved type safety and structure ([1bc5a11](https://github.com/allthingslinux/portal/commit/1bc5a11032ffa376dc7bf25798adb5abc77e3899))
* **types:** centralize types and constants organization for improved structure ([3641cc6](https://github.com/allthingslinux/portal/commit/3641cc6815d52f152ea71bdf0e51bff83a133ea8))
* **utils:** add utility modules for constants, date formatting, error handling, and string manipulation ([402aa53](https://github.com/allthingslinux/portal/commit/402aa53147744f6782a0f14067804b1645a948a1))
* **web-vitals:** enhance Web Vitals reporting with attribution support ([97aef24](https://github.com/allthingslinux/portal/commit/97aef24b773ce5c14a1fcce42d71f004d524c6cc))
* **xmpp:** add XMPP account management component ([5836c90](https://github.com/allthingslinux/portal/commit/5836c90b2355eac11dc0efee6573951e4da12402))
* **xmpp:** add XMPP account schema definition ([73ebb52](https://github.com/allthingslinux/portal/commit/73ebb527550932107ee4825122b4179d87bb9435))
* **xmpp:** add XMPP API client functions and query keys ([47b665c](https://github.com/allthingslinux/portal/commit/47b665cdac85536044b623141adcd27f6dcf9a27))
* **xmpp:** create XMPP account management page ([60febec](https://github.com/allthingslinux/portal/commit/60febec2bb566b3c8b64a955525a79ada01e83c3))
* **xmpp:** enhance XMPP account management and validation ([36f749c](https://github.com/allthingslinux/portal/commit/36f749c4012dca75c9112d0e577349d2f5aabd83))
* **xmpp:** enhance XMPP configuration and observability integration ([9b83af7](https://github.com/allthingslinux/portal/commit/9b83af7aa82ceb484ff1d5d3eb11793142331a73))
* **xmpp:** implement hooks for XMPP account management ([61d996e](https://github.com/allthingslinux/portal/commit/61d996e87d67849c527d771e3c23add5704f8166))
* **xmpp:** implement Prosody integration for XMPP account management ([747a0b3](https://github.com/allthingslinux/portal/commit/747a0b3a43de9e2c2b14792d04fe6b01e35b497f))
* **xmpp:** implement Prosody REST API client for account management ([ebcf263](https://github.com/allthingslinux/portal/commit/ebcf2636cf96faf086bd24068b28e10b4112a533))
* **xmpp:** implement XMPP account API routes ([4b50efd](https://github.com/allthingslinux/portal/commit/4b50efdb0a1cb506c4f69f9961f94ecf6fd7a1ee))
