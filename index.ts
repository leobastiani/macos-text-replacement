import assert from "assert";
import { createWriteStream, WriteStream } from "fs";
import _ from "lodash";
import fetch from "node-fetch";
import accents from "remove-accents";

const TEMPLATE_BEGIN = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<array>`;

const TEMPLATE_END = `</array>
</plist>`;

function write(stream: WriteStream, content: string) {
  return new Promise<void>((resolve, reject) => {
    stream.write(content + "\n", (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function create(i: number) {
  const stream = createWriteStream(
    `dist/Text-Substitutions.${i}.plist`,
    "utf-8"
  );
  await write(stream, TEMPLATE_BEGIN);
  return stream;
}

async function close(stream: WriteStream) {
  await write(stream, TEMPLATE_END);
  await new Promise<void>((resolve, reject) => {
    stream.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

(async () => {
  const resp = await fetch("https://www.ime.usp.br/~pf/dicios/br-utf8.txt");
  const words = (await resp.text()).split(`\n`);
  let i = 0;
  let fileIndex = 0;
  if (_.last(words) === "") {
    assert(words.pop() === "");
  }
  let stream = await create(0);
  const wordsMap = _.groupBy(words, (word) => accents.remove(word));
  const keys = Object.keys(wordsMap).sort((a, b) => a.localeCompare(b));
  for (const pureWord of keys) {
    if (wordsMap[pureWord].length !== 1) {
      continue;
    }
    if (!accents.has(wordsMap[pureWord][0])) {
      continue;
    }
    i++;
    await write(
      stream,
      `\t<dict>
\t\t<key>phrase</key>
\t\t<string>${wordsMap[pureWord]}</string>
\t\t<key>shortcut</key>
\t\t<string>${pureWord}</string>
\t</dict>`
    );
    if (i === 1000) {
      i = 0;
      await close(stream);
      stream = await create(++fileIndex);
    }
  }
  await close(stream);
})();
