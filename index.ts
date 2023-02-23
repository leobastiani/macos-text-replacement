import assert from "assert";
import _ from "lodash";
import fetch from "node-fetch";
import accents from "remove-accents";

(async () => {
  const resp = await fetch("https://www.ime.usp.br/~pf/dicios/br-utf8.txt");
  const words = (await resp.text()).split(`\n`);
  assert(words.pop() === "");
  console.log(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<array>`);
  const wordsMap = _.groupBy(words, (word) => accents.remove(word));
  for (const pureWord in wordsMap) {
    if (wordsMap[pureWord].length !== 1) {
      continue;
    }
    if (!accents.has(wordsMap[pureWord][0])) {
      continue;
    }
    console.log(`\t<dict>
\t\t<key>phrase</key>
\t\t<string>${wordsMap[pureWord]}</string>
\t\t<key>shortcut</key>
\t\t<string>${pureWord}</string>
\t</dict>`);
  }
  console.log(`</array>
</plist>`);
})();
