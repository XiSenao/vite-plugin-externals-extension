#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
WHITE='\033[0;37m'
required_pnpm_version='1.10.1'

fail () {
  printf "${RED}$@\n${WHITE}"
  exit -1
}

info () {
  printf "${GREEN}$@\n${WHITE}"
}

command_exists () {
  type "$1" >/dev/null 2>&1
}

version_gte () {
  test "$(printf '%s\n%s\n' $1 $2 | sort -V | head -n 1)" == "$1";
}

if ! command_exists pnpm ; then
  fail 'pnpm not found. Install with `brew install pnpm`'
fi

if version_gte "$required_pnpm_version" $(pnpm --version) ; then
  info "pnpm version ok"
else
  fail "Requires pnpm >= $required_pnpm_version"
fi

