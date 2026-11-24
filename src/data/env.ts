// Source: repo/packages/config/src/schema.ts (names, defaults), packages/config/src/load.ts (rules between variables),
// packages/config/src/settings.ts (secrets, what the image sets),
// repo/README.md Configuration table and deploy/.env.example (wording). Keep in sync with those.
//
// `instanceSetting: true` marks a variable whose setting is also editable in Instance settings in the dashboard.
// A variable that is set wins and locks the setting there ("Set by <VAR>", and a save is refused); otherwise the
// value saved in the dashboard applies, otherwise the default. Keep in step with
// src/content/docs/self-hosting/instance-settings.mdx.

export interface EnvVar {
  name: string
  /** Shown as written; `required` variables have no default. */
  default?: string
  required?: boolean
  description: string
  /** Also editable in Instance settings. Set, the variable wins and locks it there. */
  instanceSetting?: boolean
}

export interface EnvGroup {
  id: string
  title: string
  intro?: string
  vars: EnvVar[]
}

export const envGroups: EnvGroup[] = [
  {
    id: 'core',
    title: 'Core',
    vars: [
      { name: 'DATABASE_URL', required: true, description: 'Postgres connection string. The worker listens with Postgres LISTEN/NOTIFY, so use a direct connection or session pooling, not a transaction pooler such as PgBouncer in transaction mode.' },
      { name: 'BETTER_AUTH_SECRET', required: true, description: 'Signs sessions and cookies. At least 32 characters (`openssl rand -base64 32`). Keep it secret and stable: changing it signs everyone out.' },
      { name: 'PUBLIC_URL', default: 'http://localhost:3000', description: 'The dashboard address, any host you own (`https://ci.acme.io`). It must be the root of its own hostname (no sub-path). Use https outside local development; a plain http address on a public host logs a warning.' },
      { name: 'PREVIOUS_PUBLIC_URLS', default: '(empty)', description: 'Comma-separated old dashboard addresses. Requests to them are redirected to `PUBLIC_URL`, so old links in pull request comments and emails keep working after a move. A previous address can\'t equal the current host.' },
      { name: 'TRUSTED_PROXIES', default: 'none', description: 'Reverse proxies whose `X-Forwarded-For` is believed: comma-separated IPs or CIDR ranges (`10.0.0.5,172.16.0.0/12`), or `true` for any hop (unsafe unless the app is reachable only through the proxy). Behind a proxy, set it to the proxy address, or every user shares the proxy address and one rate limit.' },
      { name: 'HOST', default: '0.0.0.0', description: 'Address the HTTP server binds to. The image sets it to `0.0.0.0`.' },
      { name: 'PORT', default: '3000', description: 'Port the HTTP server listens on (1 to 65535). The image sets it to 3000, which its health check, the Caddyfile and the Terraform module rely on.' },
      { name: 'LOG_LEVEL', default: 'info', description: 'One of `fatal`, `error`, `warn`, `info`, `debug`, `trace`.' },
      { name: 'NODE_ENV', default: 'production', description: '`development`, `production` or `test`. The image runs as production.' },
      { name: 'DATABASE_POOL_MAX', default: '10', description: 'Largest number of Postgres connections one process keeps open.' },
      { name: 'CIRCI_MIGRATIONS', default: 'source tree layout', description: 'Folder of SQL migrations. The Docker image sets it to `/app/migrations`; set it when you run the bundle outside the image.' },
      { name: 'CIRCI_WEB_DIST', default: 'source tree layout', description: 'Folder with the built dashboard. The image sets it to `/app/web`; set it when you run the bundle outside the image.' },
    ],
  },
  {
    id: 'storage',
    title: 'Storage',
    vars: [
      { name: 'STORAGE_DRIVER', default: 'fs', description: '`fs` (local disk) or `s3` (any S3-compatible service).' },
      { name: 'STORAGE_PATH', default: '/var/lib/circi/files', description: 'Directory for the `fs` driver. The image sets it to `/var/lib/circi/files`, the volume in the compose file and the Terraform module.' },
      { name: 'S3_BUCKET', description: 'Bucket name. Required when `STORAGE_DRIVER=s3`.' },
      { name: 'S3_REGION', default: 'us-east-1', description: 'Bucket region.' },
      { name: 'S3_ENDPOINT', description: 'A custom endpoint for R2, B2, MinIO or LocalStack. Leave empty for AWS. Must be a URL.' },
      { name: 'S3_FORCE_PATH_STYLE', default: 'true when S3_ENDPOINT is set, otherwise false', description: 'Use path-style addressing (MinIO, LocalStack).' },
      { name: 'S3_ACCESS_KEY_ID', description: 'Static credentials. Set both key variables, or neither to use the AWS credential chain (an IAM role).' },
      { name: 'S3_SECRET_ACCESS_KEY', description: 'See `S3_ACCESS_KEY_ID`.' },
      { name: 'S3_CONNECT_TIMEOUT_SECONDS', default: '10', description: 'Give up connecting after this long (1 to 600), so a dropped connection can\'t hang a request or job.' },
      { name: 'S3_REQUEST_TIMEOUT_SECONDS', default: '60', description: 'Give up when S3 sends or accepts nothing for this long (1 to 3600). Idle time, not total time: large files keep flowing.' },
    ],
  },
  {
    id: 'sign-in',
    title: 'Sign-in and workspaces',
    intro: 'Also editable in Instance settings. A variable that is set wins and locks the setting there; leave it unset to change it in the dashboard.',
    vars: [
      { name: 'WORKSPACE_CREATION', default: 'admin', instanceSetting: true, description: 'Who can create workspaces in the dashboard: `admin` (instance admins) or `anyone` (every signed-in account).' },
      { name: 'AUTH_PASSWORD_ENABLED', default: 'true', instanceSetting: true, description: 'Email and password sign-in. Setting it to `false` needs email codes to be available (SMTP), or nobody could sign in.' },
      { name: 'AUTH_EMAIL_ENABLED', default: 'true', instanceSetting: true, description: 'Sign-in codes by email. Only offered when SMTP is configured; `false` turns them off.' },
      { name: 'AUTH_SSO_ENABLED', default: 'true', instanceSetting: true, description: 'Set `false` to hide single sign-on even with providers configured.' },
      { name: 'AUTH_GITHUB_CLIENT_ID', instanceSetting: true, description: 'GitHub single sign-on app. Redirect URI to register: `PUBLIC_URL/api/auth/callback/github`.' },
      { name: 'AUTH_GITHUB_CLIENT_SECRET', instanceSetting: true, description: 'Secret of the GitHub sign-in app.' },
      { name: 'AUTH_GOOGLE_CLIENT_ID', instanceSetting: true, description: 'Google single sign-on. Redirect URI: `PUBLIC_URL/api/auth/callback/google`.' },
      { name: 'AUTH_GOOGLE_CLIENT_SECRET', instanceSetting: true, description: 'Secret of the Google sign-in app.' },
      { name: 'AUTH_GITLAB_CLIENT_ID', instanceSetting: true, description: 'GitLab single sign-on. Redirect URI: `PUBLIC_URL/api/auth/callback/gitlab`.' },
      { name: 'AUTH_GITLAB_CLIENT_SECRET', instanceSetting: true, description: 'Secret of the GitLab sign-in app.' },
      { name: 'AUTH_GITLAB_URL', default: 'gitlab.com', instanceSetting: true, description: 'Address of a self-managed GitLab.' },
      { name: 'AUTH_OIDC_ISSUER', instanceSetting: true, description: 'Issuer of any OpenID Connect provider (Okta, Entra ID, Keycloak, Authentik). Redirect URI: `PUBLIC_URL/api/auth/callback/oidc`.' },
      { name: 'AUTH_OIDC_CLIENT_ID', instanceSetting: true, description: 'Client ID at the OIDC provider.' },
      { name: 'AUTH_OIDC_CLIENT_SECRET', instanceSetting: true, description: 'Client secret at the OIDC provider.' },
      { name: 'AUTH_OIDC_NAME', instanceSetting: true, description: 'Label of the sign-in button.' },
      { name: 'AUTH_OIDC_TRUSTED_FOR_EMAIL', default: 'false', instanceSetting: true, description: 'Trust the provider\'s email addresses (an existing account with the same email is then linked). Set `true` only if the provider verifies every address it reports. GitHub and Google are always trusted.' },
    ],
  },
  {
    id: 'mail',
    title: 'Email (SMTP)',
    intro: 'Also editable in Instance settings (the Mail server section). Set `SMTP_HOST` and it wins and locks the section. Check it with `circi admin mail test --to you@acme.io`.',
    vars: [
      { name: 'SMTP_HOST', instanceSetting: true, description: 'Outgoing mail server. Without it, email sign-in codes, invitation mail and "new sign-in" mail are off.' },
      { name: 'SMTP_PORT', default: '587 (465 when SMTP_SECURE is true)', instanceSetting: true, description: '587 uses STARTTLS; 465 implicit TLS.' },
      { name: 'SMTP_SECURE', default: 'true when the port is 465', instanceSetting: true, description: 'Use implicit TLS.' },
      { name: 'SMTP_USER', instanceSetting: true, description: 'Username. Set `SMTP_USER` and `SMTP_PASSWORD` together, or neither for a server that needs no sign-in.' },
      { name: 'SMTP_PASSWORD', instanceSetting: true, description: 'See `SMTP_USER`.' },
      { name: 'SMTP_FROM', instanceSetting: true, description: 'Sender, e.g. `CirCI <ci@acme.io>`. Required when `SMTP_HOST` is set.' },
    ],
  },
  {
    id: 'git-hosts',
    title: 'GitHub App and Slack',
    intro: 'The Slack app is also editable in Instance settings (set `SLACK_CLIENT_ID` and it wins and locks it). The GitHub App can also be created from Instance settings (manifest flow), see the GitHub page.',
    vars: [
      { name: 'GITHUB_APP_ID', description: 'GitHub App ID. Set `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY` and `GITHUB_APP_WEBHOOK_SECRET` together or not at all.' },
      { name: 'GITHUB_APP_PRIVATE_KEY', description: 'The app\'s PEM private key; `\\n` escapes are fine.' },
      { name: 'GITHUB_APP_WEBHOOK_SECRET', description: 'Secret GitHub signs its webhooks with.' },
      { name: 'GITHUB_API_URL', default: 'https://api.github.com', description: 'For GitHub Enterprise Server: `https://ghe.example.com/api/v3`.' },
      { name: 'GITHUB_API_TIMEOUT_SECONDS', default: '15', description: 'How long one GitHub API request may take (0.1 to 600).' },
      { name: 'SLACK_CLIENT_ID', instanceSetting: true, description: 'Client ID of the Slack app CirCI posts as.' },
      { name: 'SLACK_CLIENT_SECRET', instanceSetting: true, description: 'Client secret of the Slack app.' },
      { name: 'SLACK_API_URL', description: 'Override the Slack API address (tests, proxies).' },
    ],
  },
  {
    id: 'sites',
    title: 'Hosted sites',
    vars: [
      { name: 'STATIC_SITES_HOST', description: 'A separate, dedicated domain for hosted sites (Storybook, reports). Hosting is off until it is set. Read the cookie rules on the Site domains page first. CirCI refuses a value that equals, contains or shares a parent domain with the dashboard host.' },
      { name: 'STATIC_SITES_MAX_MB', default: '200', instanceSetting: true, description: 'Largest site upload in MB (1 to 5000).' },
    ],
  },
  {
    id: 'processing',
    title: 'Build processing and background jobs',
    vars: [
      { name: 'CIRCI_DIFF_ENGINE', default: 'native', description: '`native` runs the pixel comparison in the Rust addon the image ships (about twice the builds per minute under load). If it can\'t load, the worker logs a warning and uses `js`. `js` runs on the worker\'s event loop. `js-workers` runs the same JavaScript comparison in a pool of worker threads (no native module, about 2.6 times the memory).' },
      { name: 'CIRCI_DIFF_THREADS', default: 'cores - 1', description: 'Threads of the `js-workers` engine (1 to 256). Caps its memory use.' },
      { name: 'UPLOAD_TIMEOUT_MINUTES', default: '60', instanceSetting: true, description: 'Builds still uploading after this long fail, naming the shards that never arrived. `0` never.' },
      { name: 'GC_GRACE_HOURS', default: '24', instanceSetting: true, description: 'Files nothing uses any more are deleted after this long. Builds and sites expire after the project\'s retention in days.' },
      { name: 'JOB_RETENTION_DAYS', default: '14', instanceSetting: true, description: 'Finished background jobs (done or failed) are deleted after this many days. `0` keeps them.' },
      { name: 'JOB_RETRY_BASE_SECONDS', default: '2', description: 'First wait before a failed job (webhook, git check, email) is retried; each further wait doubles. Mostly for tests.' },
      { name: 'JOB_RETRY_MAX_SECONDS', default: '300', description: 'The longest wait between two attempts of a job.' },
      { name: 'LIVE_MAX_STREAMS', default: '2000', description: 'The most [live update](/dashboard/live-updates/) streams (`GET /api/live`) one server process keeps open (1 to 100000). More get a `503` with `Retry-After`.' },
    ],
  },
  {
    id: 'webhooks-push',
    title: 'Webhooks and web push',
    vars: [
      { name: 'WEBHOOK_ALLOW_PRIVATE_ADDRESSES', default: 'false', description: 'Allow webhooks to private and loopback addresses. By default they are refused (and an OIDC issuer must be a public https address). Set `true` if your receivers live on your own network.' },
      { name: 'WEBHOOK_TIMEOUT_SECONDS', default: '10', instanceSetting: true, description: 'How long a webhook receiver may take to answer a delivery (0.1 to 600).' },
      { name: 'VAPID_PUBLIC_KEY', description: 'Web push signing key pair. Leave unset and the server makes its own on first use and keeps them in the database. Pin them when several instances share keys, or after a restore. Set both or neither.' },
      { name: 'VAPID_PRIVATE_KEY', description: 'See `VAPID_PUBLIC_KEY`.' },
      { name: 'VAPID_SUBJECT', default: 'PUBLIC_URL', description: 'Contact the push services may use. Must start with `mailto:` or `https://`.' },
    ],
  },
]

export const envCount = envGroups.reduce((n, g) => n + g.vars.length, 0)
