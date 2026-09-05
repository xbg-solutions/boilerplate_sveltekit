# Releasing

## Before you publish

1. `npm run build:packages` — clean apart from `create-frontend`'s known tsc noise, and
   every `add-js-extensions` line reports `0 unresolved`.
2. `npm run check` — 0 errors, 0 warnings. `npm test` — unit and integration green.
3. **Align versions.** Every package's `version` and every internal
   `@xbg.solutions/bpsk-*` range (`dependencies`, `peerDependencies`,
   `devDependencies`) must agree, because `bpsk-utils-*` peer on `bpsk-core` and the
   publish resolves against the registry. A one-liner that does it for all packages:

   ```
   node -e "const fs=require('fs');const V=process.argv[1];for(const d of fs.readdirSync('packages')){const f='packages/'+d+'/package.json';if(!fs.existsSync(f))continue;const p=JSON.parse(fs.readFileSync(f));p.version=V;for(const s of ['dependencies','peerDependencies','devDependencies'])for(const k of Object.keys(p[s]||{}))if(k.startsWith('@xbg.solutions/'))p[s][k]='^'+V;fs.writeFileSync(f,JSON.stringify(p,null,2)+'\n')}" 2.2.0
   npm install
   ```

   Then re-run step 1.
4. `UPGRADING.md` gets a section saying what the version asks of a consumer (even "no
   API change"). `CHANGELOG.md` gets the summary.
5. Commit; tag `bpsk-core@X.Y.Z`; push both.

## Publishing (Ben)

```
npm login                      # once; web flow
scripts/publish-all.sh
```

Checks the registry and skips what is there, warms each pending package's build, then
publishes `bpsk` CLI → `bpsk-core` → the utils in dependency order, with
`--auth-type=web` (browser second factor; the five-minute trust covers the run). Output
is captured to `scripts/publish-logs/` via `script(1)` — not `tee`, which would take
npm's TTY away and make it demand a typed code (`EOTP`).

Manual equivalent for one package:

```
npm publish -w @xbg.solutions/bpsk-core --access public --auth-type=web
```

## After you publish

- Confirm with `npm view @xbg.solutions/bpsk-core@X.Y.Z version` (and a couple of utils).
- Roll consumers: bump `@xbg.solutions/bpsk-*` ranges in `frontend/package.json`,
  `npm install`, `npm run check`, build, commit the lockfile, deploy that repo's own
  `hosting:<target-alias>` (the alias from its `.firebaserc`, not the site name). Once
  on ≥2.1.1 the `ssr.noExternal` / vitest `server.deps.inline` workarounds in sf-mapper
  and morph can go.
- Rollback is a redeploy from the consumer's previous commit (Firebase console →
  Hosting → release history also works for the static bundle).
