// uploading glossary to IBM cloudant
const fs = require("fs");
const utils = require("./utils");
const XLSX = require("xlsx");

const ACCOUNT = "5c412650-c860-4841-8589-c410d2ffd8ca-bluemix";
const PASSWORD =
  "ed49c2a51fa87d9ae8ce00423577a1de78a856529dfa9901cf163899e3c1d77a";
const CONVERSATION_LOOKUPS_DB = "conversation_lookups_20190628";
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
  const workbook = XLSX.readFile(sourceFileName);
  const sheet = workbook.Sheets["Sheet1"];

  const rowJson = XLSX.utils.sheet_to_json(sheet);
  utils.asyncForEach(rowJson, async (rowData, index) => {
    const title = rowData["title"];
    const hiragana = rowData["用語(かな)"];
    const kanji = rowData["用語"];
    let entity = kanji;
    if (hiragana) {
      entity += " （" + hiragana + "）";
    }
    const answer = rowData["修正後回答"];
    if ([kanji, hiragana, answer].includes("削除")) return;

    const synonyms = [];

    for (i = 1; i <= 10; i += 1) {
      if (rowData["類義(synonyms" + i + ")"]) {
        synonyms.push(rowData["類義(synonyms" + i + ")"]);
      }
    }

    if (kanji) {
      const jsonData = {
        intent: "Meaning",
        entities: [{ entity, kanji, hiragana, synonyms, type: "Glossary" }],
        response: answer
      };
      await utils.sleep(100);
      console.log(kanji);

      await utils.postJson(conversationLookupsUrl, jsonData);
    }
  });
};
