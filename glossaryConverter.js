// uploading glossary to IBM cloudant
const fs = require("fs");
const utils = require('./utils');

const ACCOUNT = "5c412650-c860-4841-8589-c410d2ffd8ca-bluemix";
const PASSWORD =
  "ed49c2a51fa87d9ae8ce00423577a1de78a856529dfa9901cf163899e3c1d77a";
const CONVERSATION_LOOKUPS_DB = "conversation_lookups_20180928";
const conversationLookupsUrl =
  "https://" +
  ACCOUNT +
  ":" +
  PASSWORD +
  "@" +
  ACCOUNT +
  ".cloudant.com/" +
  CONVERSATION_LOOKUPS_DB;

exports.createDocument = async sourceFileName => {
  const lines = fs
    .readFileSync(sourceFileName, "utf-8")
    .split("\r\n")
    .filter(Boolean);
  const formattedLines = [];
  let tempLine = "";
  let isTemp = false;
  for (let i = 0; i < lines.length; i++) {
    if(i === 0) continue;
    let line = lines[i];
    if (!tempLine && line.indexOf('"') !== -1 && (line.match(/"/g) || []).length === 1) {
      line = line.replace('"', "");
      tempLine += line;
      isTemp = true;
      continue;
    } else if (tempLine && line.indexOf('"') !== -1 && (line.match(/"/g) || []).length === 1) {
      line = line.replace('"', "");
      tempLine += "\r\n" + line;
      formattedLines.push(tempLine);
      tempLine = "";
      isTemp = false;
      continue;
    } else if (isTemp) {
      tempLine += "\r\n" + line;
    } else {
      line = line.replace('"', "");
      formattedLines.push(line);
    }
  }
  utils.asyncForEach(formattedLines, async line => {
    let values = line.split(",");
    const kana = values[values.length - 3];
    const kanji = values[values.length - 4];
    let answer = "";
    for (j = 0; j < values.length - 4; j+= 1) answer += values[j];
    if (kanji) {
      const jsonData = {
        intent: "Meaning",
        entities: [{ entity: kanji, type: "Glossary" }],
        response: answer
      };
      await utils.sleep(100);
      console.log(kanji);
      await utils.postJson(conversationLookupsUrl, jsonData);
    }
  });
};