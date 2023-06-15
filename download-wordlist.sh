#!/bin/bash

cd "$(dirname "$0")"

set -euo pipefail
IFS=$'\n\t'

if [ ! -f wordlist-ao-latest.txt ]; then
  wget --continue --timestamping --content-disposition https://natura.di.uminho.pt/download/sources/Dictionaries/wordlists/LATEST/wordlist-ao-latest.txt.xz
  xz -d wordlist-ao-latest.txt.xz
fi
