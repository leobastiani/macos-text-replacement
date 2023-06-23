import { readFile } from "fs/promises";
import _ from "lodash";
import accents from "remove-accents";

(async () => {
  const words = _.chain(await readFile("./wordlist-ao-latest.txt", "latin1"))
    .split(`\n`)
    .filter((word) => Boolean(word) && !word.includes("-"))
    .map((word) => word.trim().toLocaleLowerCase())
    .value();
  console.log(`name: portuguese-auto-accents
parent: default

matches:`);
  const wordsMap = _.groupBy(words, (word) => accents.remove(word));

  // exceptions
  wordsMap["amanha"] = ["amanhã"];
  // remove some words to write English
  delete wordsMap.audio;
  delete wordsMap.has;
  delete wordsMap.index;
  delete wordsMap.macos; // because of MacOS
  delete wordsMap.pros; // para + os
  delete wordsMap.so;
  delete wordsMap.video;

  let qnt = 0;

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
    qnt++;
  }
  process.stderr.write(`words added ${qnt}\n`);
})();
