const fse = require("fs-extra");
const path = require("path");
const csv = require("fast-csv");
const numeral = require("numeral");
const addIntents = require("./_intents");
const upload = require("./_upload");


const LUIS_appId = "588cb235-f10a-4909-8391-b804ab319fd0";
const LUIS_versionId = "0.1";
const LUIS_authoringKey = "6e8cf98046e44a98be7f5fe53a6369c7";
const intents = [];

// NOTE: final output of add-utterances api named utterances.upload.json
const downloadFile = "./faq.csv";
const uploadFile = "./utterances.json";

/* input and output files for parsing CSV */
var configParse = {
  inFile: path.join(__dirname, downloadFile),
  outFile: path.join(__dirname, uploadFile)
};

/* add intents parameters */
var configAddIntents = {
  LUIS_subscriptionKey: LUIS_authoringKey,
  LUIS_appId: LUIS_appId,
  LUIS_versionId: LUIS_versionId,
  intentList: intents,
  uri:
    "https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/{appId}/versions/{versionId}/intents"
};

/* add utterances parameters */
var configAddUtterances = {
  LUIS_subscriptionKey: LUIS_authoringKey,
  LUIS_appId: LUIS_appId,
  LUIS_versionId: LUIS_versionId,
  inFile: path.join(__dirname, uploadFile),
  batchSize: 100,
  uri:
    "https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/{appId}/versions/{versionId}/examples"
};

const utterance = function(rowAsString) {
  let json = {
    text: "",
    intentName: ""
  };

  if (!rowAsString) return json;

  let dataRow = babyparse.parse(rowAsString);
  // Get intent name and utterance text
  json.intentName = dataRow.data[0][intent_column];
  json.text = dataRow.data[0][utterance_column];
  // For each column heading that may be an entity, search for the element in this column in the utterance.
  entityNames.forEach(function(entityName) {
    entityToFind = dataRow.data[0][entityName.column];
    if (entityToFind != "") {
      strInd = json.text.indexOf(entityToFind);
      if (strInd > -1) {
        let entityLabel = {
          entityName: entityName.name,
          startCharIndex: strInd,
          endCharIndex: strInd + entityToFind.length - 1
        };
        json.entityLabels.push(entityLabel);
      }
    }
  }, this);
  return json;
};

const convert = async config => {
  try {
    var i = 0;
    // get inFile stream
    inFileStream = await fse.createReadStream(config.inFile, "utf-8");
    // create out file
    var myOutFile = await fse.createWriteStream(config.outFile, "utf-8");
    var utterances = [];

    var csvStream = csv()
      .on("data", function(data) {
        if (i++ === 0) {
          return;
        }
        if (data) {
          data[0].split("\r\n").forEach(q => {
            const utterance = {
              text: q,
              intentName: "faq_" + numeral(i - 1).format("000000")
            };
            utterances.push(utterance);
          });
        }

        console.log(data);
      })
      .on("end", function() {
        myOutFile.write(
          JSON.stringify({
            converted_date: new Date().toLocaleString(),
            utterances: utterances
          })
        );
        myOutFile.end();
        console.log("done");
      });
    inFileStream.pipe(csvStream);
  } catch (err) {
    throw err;
  }
};

exports.importIntents = async sourceFileName => {
  // await convert(configParse);
  for(let i = 1; i < 590; i ++) {
    configAddIntents.intentList.push(numeral("faq_" + i).format("00000"));
  }
  await addIntents(configAddIntents);
  // await upload(configAddUtterances);
};
