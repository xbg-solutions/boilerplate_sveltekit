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

# Everything that reaches the console is also appended to a timestamped log
# under scripts/publish-logs/, so a failure can be read back after the fact.
mkdir -p scripts/publish-logs
LOG="scripts/publish-logs/publish-$(date +%Y%m%dT%H%M%S).log"
exec > >(tee -a "$LOG") 2>&1
echo "publish run $(date -Iseconds) as $(npm whoami 2>/dev/null || echo 'NOT LOGGED IN') -> $LOG"
ORDER="bpsk bpsk-core bpsk-test-utils bpsk-utils-sanitizer bpsk-utils-secure-storage bpsk-utils-csrf bpsk-utils-rbac bpsk-utils-firebase-auth bpsk-utils-api-client bpsk-utils-mutex bpsk-utils-event-bus bpsk-utils-file-upload bpsk-utils-performance bpsk-utils-recaptcha bpsk-utils-seo bpsk-utils-sse bpsk-utils-state-manager bpsk-utils-tab-sync"
# Pass 1: work out what is still missing, BEFORE asking for a code, so the
# 30-second OTP window is not spent on registry lookups.
pending=""
for short in $ORDER; do
  name="@xbg.solutions/$short"
  dir=$(node -e "const fs=require('fs');for(const d of fs.readdirSync('packages')){const f='packages/'+d+'/package.json';if(fs.existsSync(f)&&JSON.parse(fs.readFileSync(f)).name==='$name'){console.log(d);break}}")
  if [ -z "$dir" ]; then echo "FAILED  $name (no workspace directory carries that name)"; exit 1; fi
  version=$(node -p "require('./packages/$dir/package.json').version")
  if [ -z "$version" ]; then echo "FAILED  $name (could not read version)"; exit 1; fi
  if npm view "$name@$version" version >/dev/null 2>&1; then
    echo "skip    $name@$version (already on the registry)"
  else
    echo "pending $name@$version"
    pending="$pending $short:$dir:$version"
  fi
done
if [ -z "$pending" ]; then echo "nothing to publish (log: $LOG)"; exit 0; fi

# Pass 2: build everything pending now, so prepublishOnly's tsc is warm and
# quick, then take the code and publish immediately.
for item in $pending; do
  dir=${item#*:}; dir=${dir%%:*}
  (cd "packages/$dir" && npm run build --if-present >/dev/null 2>&1) || echo "warning: build failed in packages/$dir (publish will retry it)"
done
if [ -z "$OTP" ]; then
  printf 'Enter the six-digit code from your authenticator NOW: '
  read -r OTP </dev/tty
fi

failed=""
for item in $pending; do
  short=${item%%:*}; rest=${item#*:}; dir=${rest%%:*}; version=${rest#*:}
  name="@xbg.solutions/$short"
  if npm publish -w "$name" --access public --otp="$OTP"; then
    echo "ok      $name@$version"
  else
    echo "FAILED  $name@$version (EOTP = code expired, re-run with a new one; E401/E404 = not logged in)"
    failed="$failed $short"
  fi
done
[ -z "$failed" ] && echo "all published (log: $LOG)" || { echo "not published:$failed (log: $LOG)"; exit 1; }
