const request = require("request");
const fs = require("fs");
const ACCOUNT = "5c412650-c860-4841-8589-c410d2ffd8ca-bluemix";
const PASSWORD =
  "ed49c2a51fa87d9ae8ce00423577a1de78a856529dfa9901cf163899e3c1d77a";
const CONVERSATION_LOOKUPS_DB = "conversation_lookups";
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
    .split("\n")
    .filter(Boolean);
    for(let i = 0; i < lines.length; i++) {
      
      const line = lines[i];
      const values = line.split(",");
      const kanji = values[0];
      const kana = values[1];
  
      const answer = line
        .split(",")
        .slice(2)
        .join(",");
      if (kanji) {
        const jsonData = {
          intent: "Meaning",
          entities: [{ entity: kanji, type: "Glossary" }],
          response: answer
        };
        setTimeout(() => {
          console.log(kanji)
        }, 300);
        await postJson(conversationLookupsUrl, jsonData);
      }
    }
};

const postJson = async (url, jsonData, callback) => {
  return new Promise((resolve, reject) => {
    request.post(
      {
        url: url,
        header: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        json: jsonData
      },
      (err, response, body) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        if (callback) {
          callback(body);
        }
        resolve(body);
      }
    );
  });
};
