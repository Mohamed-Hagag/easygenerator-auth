# Easy Auth

A sign-up and sign-in module: a React app, a NestJS API and MongoDB.

- **Sign up** with email, name and password, with live password rules
- **Sign in** and **log out**
- **Home page**, only for signed-in users: "Welcome to the application."
- **Protected endpoint:** `GET /api/users/me`
- **Extras:** error handling, unit tests, structured logging, Swagger docs and CI

How AI was used is described in [AI.md](AI.md).

## Stack

| Part     | Tools                                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------- |
| Web      | React 19, TypeScript, Vite, Tailwind CSS 4, Radix UI primitives, React Router, TanStack Query, React Hook Form, Zod |
| API      | NestJS 12, TypeScript, Mongoose, class-validator, argon2, JWT, pino, Swagger                                        |
| Database | MongoDB 8                                                                                                           |
| Tooling  | npm workspaces, ESLint, Prettier, Vitest                                                                            |

## Run it locally

You need Node 24 (`.nvmrc`) and either Docker or your own MongoDB.

```bash
nvm use                    # or install Node 24 another way
npm install
cp .env.example .env
docker compose up -d       # MongoDB on localhost:27017
npm run dev                # API and web app
```

Open <http://localhost:5173>. Use `localhost`, not `127.0.0.1`: the API only accepts writes from that origin.

**Without Docker:** skip `docker compose` and set `MONGODB_URI` in `.env` to any MongoDB, for example a free Atlas cluster.

**API docs:** <http://localhost:5173/api/docs>. Use port 5173 there too; requests that change data are rejected from port 3000.

## Scripts

| Command                                   | What it does                                        |
| ----------------------------------------- | --------------------------------------------------- |
| `npm run dev`                             | Starts both apps; `dev:api` and `dev:web` start one |
| `npm test`                                | API unit tests                                      |
| `npm run lint` / `npm run typecheck`      | Checks both apps                                    |
| `npm run format` / `npm run format:check` | Prettier                                            |
| `npm run build`                           | Builds both apps into their `dist` folders          |
| `npm start -w api`                        | Runs the built API                                  |
| `npm run preview -w web`                  | Serves the built web app on port 5173               |

## Settings

The API reads `.env` in the repository root and refuses to start if a setting is missing or invalid.

| Variable                   | Purpose                                                            | Default  |
| -------------------------- | ------------------------------------------------------------------ | -------- |
| `NODE_ENV`                 | `development`, `test` or `production`                              | required |
| `PORT`                     | API port; the Vite proxy expects 3000                              | `3000`   |
| `MONGODB_URI`              | MongoDB connection                                                 | required |
| `JWT_ACCESS_SECRET`        | At least 32 characters; the example value is refused in production | required |
| `ACCESS_TOKEN_TTL_SECONDS` | Access token lifetime                                              | `900`    |
| `REFRESH_TOKEN_TTL_DAYS`   | Session length                                                     | `7`      |
| `WEB_ORIGIN`               | The only browser origin that may change data                       | required |
| `TRUST_PROXY_HOPS`         | Reverse proxies in front of the API                                | `0`      |
| `SWAGGER_ENABLED`          | Serves `/api/docs`                                                 | `false`  |
| `LOG_LEVEL`                | pino log level                                                     | `info`   |

## API

| Endpoint                 | Access         | Success               | Main errors |
| ------------------------ | -------------- | --------------------- | ----------- |
| `POST /api/auth/signup`  | public         | 201, user and cookies | 400, 409    |
| `POST /api/auth/signin`  | public         | 200, user and cookies | 400, 401    |
| `POST /api/auth/refresh` | refresh cookie | 204, new cookies      | 401         |
| `POST /api/auth/logout`  | public         | 204, cookies cleared  |             |
| `GET /api/users/me`      | **signed in**  | 200, user             | 401         |
| `GET /api/health`        | public         | 200                   |             |

Any endpoint can also return 429 (rate limit), and 403 for changes from another origin. Errors share one shape:

```json
{ "statusCode": 400, "message": "Validation failed", "errors": { "email": ["Enter a valid email address"] } }
```

| Field    | Rules                                                                              |
| -------- | ---------------------------------------------------------------------------------- |
| Email    | Valid format, at most 254 characters, unique regardless of case                    |
| Name     | 3 to 100 characters                                                                |
| Password | 8 to 128 characters with at least one letter, one number and one special character |

Letters and numbers of any language count.

## Structure

```
apps/
├── api/src/
│   ├── auth/        sign up, sign in, passwords, current user
│   ├── sessions/    session storage, tokens, cookies, access guard
│   ├── users/       user storage and GET /users/me
│   ├── common/      error format, origin check, logging setup
│   ├── config/      validation of settings
│   └── health/
└── web/src/
    ├── pages/       one file per page
    ├── components/
    │   ├── layouts/ page layout and route guards
    │   └── ui/      generic components
    ├── hooks/       session state and actions
    └── utils/       API client, errors, form rules
```

## How sessions work

1. Signing up or in stores a session in MongoDB and sets two httpOnly, `SameSite=Strict` cookies: a 15-minute access JWT and a refresh token that is only sent to `/api/auth`.
2. Every endpoint is protected unless marked `@Public()`. The guard checks the JWT **and** that its session still exists, so logging out takes effect immediately.
3. When the access token expires, the web app refreshes once and repeats the request. Refresh tokens work once. MongoDB stores only a hash, and using an old token again ends the session, because it may have been stolen.
4. Tabs take turns refreshing through the Web Locks API, so they do not trigger that protection by accident.
5. A session lasts 7 days from sign-in and is not extended.

Other protections: argon2id password hashes, one answer for a wrong password and an unknown email, rate limits (10 sign-ins and 10 sign-ups per minute per IP), security headers, rejection of unknown fields, and no internal details in error responses. Logs contain request ids and user ids, but no credentials, emails, names, request bodies or IP addresses.

## Testing

`npm test` runs 71 API unit tests: validation rules, sign-up and sign-in, session rotation and reuse, and the guards. They use fake database models.

There are no end-to-end or frontend tests in the repository. Instead, 21 browser scenarios were run in Chrome against a real API and MongoDB with a throwaway script: both forms, redirects, reload, expired tokens in two tabs, logout, API outages, rate limits, keyboard use and phone width. They passed in development mode and against the production build. Other browsers were not tested.

GitHub Actions runs the format check, lint, typecheck, tests and build on every push to `main` and on pull requests.

Next I would add end-to-end tests, since cookies and guards are only partly covered by unit tests.

## Production notes and known limits

- Serve the web build and `/api` from **one HTTPS origin**, and return `index.html` for unknown web paths. `Secure` cookies and Web Locks need HTTPS.
- Use a MongoDB user with a password, a random `JWT_ACCESS_SECRET`, and the right `TRUST_PROXY_HOPS`, or rate limits will use the proxy's address.
- Rate limits are kept in memory per API instance. Several instances need a shared store such as Redis.
- Sign-up reveals whether an email is registered. Avoiding that needs email verification.
- There is no password reset or email verification.
- If the response to a refresh is lost on the network, the user has to sign in again.
- Mongoose creates indexes at startup; a larger system would use migrations.
- `GET /api/health` only shows that the process is running.
- Malformed JSON gets a 400 but is rejected before the request logger, so it is not logged.
- Form rules exist in both apps. A shared package would be worth it with more forms.
- `npm audit` reports 2 moderate findings in a lint plugin's dependency. Production dependencies have none (`npm audit --omit=dev`).
