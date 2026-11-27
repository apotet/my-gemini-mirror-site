# Account sync: NetOps mirror only

The opt-in first release syncs favorite lesson IDs and the Beginner course's
last intentionally opened lesson. It does **not** sync completed lessons yet
(the lesson-test result and pass rule are not implemented), question answers,
scores, history, photos, or editorial approval. Without sign-in, existing
guest state stays in that browser. Signing out returns to the guest state.

## Staging setup

1. Use a dedicated **mirror** Firebase project on Spark. Register a Web app,
   create a Cloud Firestore database in production mode (deny by default), enable
   Google as an Authentication provider, and add `apotet.github.io` under
   Authentication → Settings → Authorized domains. The default Firebase auth
   domain from the web app config is used for the Google popup. Do not enable
   billing, Analytics, or an anonymous sign-in provider for this pilot.
2. Review and publish `firestore.rules` in that dedicated project's default
   database. This file is **not** safe to deploy over an unrelated Firebase
   project: it intentionally does not preserve any unrelated rules. Never
   use a service account key in a browser, or paste one into a chat or repo.
3. Set the public Firebase Web app values as mirror repository Actions variables,
   or as local Vite environment variables for a private staging build:

   | Variable | Web config field |
   | --- | --- |
   | `VITE_NETOPS_FIREBASE_API_KEY` | `apiKey` |
   | `VITE_NETOPS_FIREBASE_AUTH_DOMAIN` | `authDomain` |
   | `VITE_NETOPS_FIREBASE_PROJECT_ID` | `projectId` |
   | `VITE_NETOPS_FIREBASE_APP_ID` | `appId` |

   These identify the public web app; they do not confer Firestore access.
   Do not copy the variables or configuration into production. If the
   mirror's Web app config is absent, the sync feature stays disabled.
   GitHub Pages paths on the same host share a browser origin: only activate
   on a host where all deployed apps are trusted, or use a dedicated mirror
   origin. Use a separate Firebase project for live production.

References: [Firebase Google sign-in](https://firebase.google.com/docs/auth/web/google-signin),
[Firestore rules](https://firebase.google.com/docs/firestore/security/rules-conditions),
[Firebase pricing plans](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans).

## Account isolation and data flow

- `netopsMirrorUsers/{uid}/favorites/{lessonId}` holds just `{active: boolean}`.
  Removing a favorite keeps a false marker. Imports only create a missing record,
  so a device with an old local bookmark cannot resurrect a removal.
- `netopsMirrorUsers/{uid}/settings/resume` holds just `{lessonId: string}`.
  Import may initialize a missing checkpoint but must not overwrite an account's
  existing checkpoint. Deliberately opening a core lesson updates it.
- The Firebase account UID scopes all access. Users cannot read or modify another
  account or list user records. Firebase Authentication handles the Google
  identity; application records in Firestore do not store an email or profile.
- Import is separate from sign-in and doesn't delete the browser's guest data.
  A new device signs in to the same account to see account state.

## Acceptance before any real data

- Run `scripts/firebase-sync-rules.test.mjs` against the loopback Firestore
  emulator only (requires Java 21 and Firebase CLI plus `firebase` and
  `@firebase/rules-unit-testing` compatible with the app's Firebase SDK).
  Use `firebase emulators:exec --only firestore --project demo-netops-sync 'node scripts/firebase-sync-rules.test.mjs'`.
- In two independent browser profiles, use a test account. Add different
  favorites concurrently and verify both survive. Remove on one device, then
  import a stale guest copy on the other; it must stay removed. Verify the
  resume checkpoint syncs across logins and does not change on incidental
  visits. Test sign-out, reload, a separate user, and network interruption.
- Verify first sign-in on Safari/iOS and desktop against the staging build,
  including Google popup and a reload. Emulators cannot verify Google's real
  sign-in or the deployed project's configuration.

## Rollback

To stop new launches of cloud sync, remove the mirror build variables and rebuild
the mirror. Do not delete the data during rollout rollback. If access must be
disabled immediately, replace the dedicated Firestore project's rules with
deny-all rules before rebuilding. Guest bookmarks/checkpoints are not erased by
either step.
