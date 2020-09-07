#!/usr/bin/env bash
set -uo pipefail
IFS=$'\n\t'

# ESLint staged changes only
git diff --diff-filter=d --cached --name-only -z -- '*.js' '*.jsx' '*.ts' '*.tsx' \
  | xargs -0 -I % sh -c 'git show ":%" | ./node_modules/.bin/eslint --stdin --stdin-filename "%";'
eslint_exit=$?

if [ ${eslint_exit} -eq 0 ]; then
  echo "✓ ESLint passed"
else
  echo "✘ ESLint failed!" 1>&2
  exit ${eslint_exit}
fi
