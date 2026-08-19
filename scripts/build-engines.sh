#!/usr/bin/env bash
# Compiles the mini-game engines to plain ESM so they can be driven headlessly
# by scripts/game-engine-test.mjs. Node ESM needs explicit .js extensions, which
# tsc does not add, so they are patched in afterwards.
set -euo pipefail

cd "$(dirname "$0")/.."
OUT=".tmp-engines"

rm -rf "$OUT"
npx tsc \
  src/components/minigame/engine.ts \
  src/components/minigame/types.ts \
  src/components/minigame/games/cash-flow.ts \
  src/components/minigame/games/bug-squash.ts \
  src/components/minigame/games/close-deal.ts \
  --outDir "$OUT" --module esnext --target es2022 \
  --moduleResolution bundler --skipLibCheck

find "$OUT" -name "*.js" -exec sed -i '' -E \
  "s|from '(\.\.?/[^']*)'|from '\1.js'|g; s|from \"(\.\.?/[^\"]*)\"|from \"\1.js\"|g" {} \;

echo '{"type":"module"}' > "$OUT/package.json"
echo "engines compiled to $OUT"
