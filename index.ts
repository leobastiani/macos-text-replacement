import assert from "assert";
import _ from "lodash";
import fetch from "node-fetch";
import accents from "remove-accents";

(async () => {
  const resp = await fetch("https://www.ime.usp.br/~pf/dicios/br-utf8.txt");
  const words = (await resp.text())
    .split(`\n`)
    .map((word) => word.trim().toLocaleLowerCase());
  assert(words.pop() === "");
  console.log(`name: portuguese-auto-accents
parent: default

matches:`);
  const wordsMap = _.groupBy(words, (word) => accents.remove(word));
  for (const pureWord in wordsMap) {
    if (wordsMap[pureWord].length !== 1) {
      continue;
    }
    if (!accents.has(wordsMap[pureWord][0])) {
      continue;
    }
    console.log(`  - trigger: ${pureWord.toLocaleLowerCase()}
    replace: ${wordsMap[pureWord][0].toLocaleLowerCase()}
    propagate_case: true
    word: true`);
  }
})();
