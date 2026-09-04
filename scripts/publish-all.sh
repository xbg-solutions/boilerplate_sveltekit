#!/usr/bin/env bash
# Publish every workspace package in dependency order (core first, then the
# utils in an order where every peer is already on the registry).
#
#   npm login                      # once; 2FA token lands in ~/.npmrc
#   scripts/publish-all.sh 123456   # the six-digit code from your authenticator,
#                                  # or no argument to let npm prompt for it
#
# Already-published versions are skipped, so re-run with a fresh OTP if the
# first one expires part-way through.
set -u
OTP="${1:-}"
cd "$(dirname "$0")/.."
ORDER="bpsk bpsk-core bpsk-test-utils bpsk-utils-sanitizer bpsk-utils-secure-storage bpsk-utils-csrf bpsk-utils-rbac bpsk-utils-firebase-auth bpsk-utils-api-client bpsk-utils-mutex bpsk-utils-event-bus bpsk-utils-file-upload bpsk-utils-performance bpsk-utils-recaptcha bpsk-utils-seo bpsk-utils-sse bpsk-utils-state-manager bpsk-utils-tab-sync"
failed=""
for short in $ORDER; do
  name="@xbg.solutions/$short"
  dir=$(node -e "const fs=require('fs');for(const d of fs.readdirSync('packages')){const f='packages/'+d+'/package.json';if(fs.existsSync(f)&&JSON.parse(fs.readFileSync(f)).name==='$name'){console.log(d);break}}")
  version=$(node -p "require('./packages/$dir/package.json').version")
  if npm view "$name@$version" version >/dev/null 2>&1; then
    echo "skip    $name@$version (already on the registry)"; continue
  fi
  if npm publish -w "$name" --access public ${OTP:+--otp="$OTP"}; then
    echo "ok      $name@$version"
  else
    echo "FAILED  $name@$version (E401/E404 = not logged in; EOTP = code expired, re-run with a new one)"
    failed="$failed $short"
  fi
done
[ -z "$failed" ] && echo "all published" || { echo "not published:$failed"; exit 1; }
