# How AI was used

I built this with Claude Code (Claude Opus 5.5). I set the constraints, made the decisions, approved each step, reviewed the result, directed the refactoring and made the commits. The table below shows which parts were AI-assisted.

## How we worked

I started with the requirements and one rule: we plan the tools for the frontend and backend together, and nothing happens without my approval.

1. **Plan first.** We agreed on the repository setup, both stacks, the session design, the bonus scope and the tests before any code existed.
2. **Seven small steps.** Repository, API scaffold, sign-up and sign-in, sessions, web scaffold, pages, documents. For each one the AI listed its files, packages, behaviour and open questions, and waited for my go-ahead.
3. **Check every step.** Format, lint, typecheck, tests and build, plus real requests or a real browser. Then I committed.
4. **Review and simplify.** I read through the backend and the frontend, tried the app in the browser, and had the parts that were too complicated reduced.

## What was AI-assisted

| Part                   | AI                                 | Me                                                                           |
| ---------------------- | ---------------------------------- | ---------------------------------------------------------------------------- |
| Stack and architecture | Options with trade-offs            | Choices and constraints                                                      |
| API, web app, tests    | Implementation of the agreed steps | Approved, reviewed, directed changes                                         |
| UI components          | Adapted them                       | Button, field, input, label and spinner come from an earlier project of mine |
| Verification           | Wrote and ran the checks           | Tried the app by hand                                                        |
| README and this file   | Drafted                            | Provided the content about my part, approved                                 |

## Prompts and approaches that worked

The prompts are summarized here by intent rather than quoted.

| Approach              | What it involved                                                                                                   | Why it worked                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| Plan before code      | Compare the options for the repository, frontend, backend and session design, and make no changes without approval | Choices were discussed before they were in the code    |
| Small, approved steps | For each step, list the files, packages, behaviour and open questions, then wait                                   | Every change was small enough to review                |
| Reference code        | Follow the conventions and UI components of an existing project of mine                                            | More precise than describing a style                   |
| Justify the design    | Explain why a file, abstraction or check exists, and propose something simpler if it is not needed                 | Removed unnecessary code quickly                       |
| Explain the code      | Walk through key files line by line                                                                                | Made review easier and revealed code without a purpose |
| Dedicated reviews     | Review the whole backend, then the whole frontend, after the features worked                                       | Each review found a real problem                       |
| Evidence              | Verify with real requests, a real browser and a real database, not only unit tests                                 | Found bugs that the unit tests missed                  |

## Decisions I made

The last column shows where the AI's first proposal was different.

| Area                    | Decision                                                                                                                        | First proposal                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| UI                      | Radix primitives with Tailwind, based on my own components                                                                      | Radix Themes                                            |
| Tests                   | Focused unit tests for the API                                                                                                  | End-to-end tests of the auth flow                       |
| Extras                  | Swagger, structured logging and a basic CI workflow                                                                             | A wider set, also including Docker images for both apps |
| API structure           | Feature folders with clear responsibilities: credentials in `auth/`, session code in `sessions/`, shared code in `common/`      | All of it in `auth/`, later a full module template      |
| Architecture principles | Do not abstract code that is not reused, keep related files and logic together, and handle only failures that can really happen | More abstraction, separate files and defensive checks   |

I also approved changes to the plan when the facts called for it: Vitest instead of Jest, because NestJS 12 uses ES modules; another argon2 package, because it has no install script; and logout that takes effect immediately, at the cost of a session lookup on each protected request.

That last choice brings the design close to plain server-side sessions, which would be simpler. I kept the refresh tokens for the short-lived access token and the detection of reused tokens.

## What had to be corrected

| Problem                                                                                                       | How it was found                        | Fix                                                |
| ------------------------------------------------------------------------------------------------------------- | --------------------------------------- | -------------------------------------------------- |
| Only one password error was returned, because repeated `@Matches` rules overwrite each other                  | Manual API requests                     | Named rules and a test                             |
| Session `userId` was stored as text instead of an ObjectId. Unit tests missed it because they use fake models | Backend review                          | Correct schema type, checked in MongoDB            |
| An error-filter branch that never ran                                                                         | My question about what the file was for | Removed after checking real responses              |
| A late failed refresh could clear the cookies right after a sign-in                                           | Thinking through the session hook       | Sign-in, sign-up and logout share the refresh lock |
| The first version of the simpler guard could clear a half-filled form during an outage                        | Browser check                           | Wait for the first session check only              |
| ESLint failed in the editor but passed in the terminal                                                        | My editor                               | Explicit project root in the web config            |
| `npm run preview` could not sign in, because of the origin check                                              | Frontend review                         | Preview uses the allowed port                      |
| Unused component options and helpers                                                                          | Frontend review                         | Removed                                            |

**Checks can be wrong too.** Some early requests "proved" that invalid sessions were rejected, but the cookies had never been saved, so the 401s meant nothing. They were repeated with a valid session first. The two-tab test has a similar control: without the lock, overlapping refreshes do end the session.
