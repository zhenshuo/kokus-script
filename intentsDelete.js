
const request = require("request");

const LUIS_appId = "588cb235-f10a-4909-8391-b804ab319fd0";
const LUIS_versionId = "0.1";
const LUIS_authoringKey = "6e8cf98046e44a98be7f5fe53a6369c7";

let intents = [];

var configGetIntents = {
  LUIS_subscriptionKey: LUIS_authoringKey,
  LUIS_appId: LUIS_appId,
  LUIS_versionId: LUIS_versionId,
  uri:
    "https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/{appId}/versions/{versionId}/intents"
};

exports.deleteIntents = async () => {
  const url = configGetIntents.uri.replace("{appId}", configGetIntents.LUIS_appId).replace("{versionId}", configGetIntents.LUIS_versionId);
  await getIntents(url, configGetIntents.LUIS_subscriptionKey, (response) => {
    intents = JSON.parse(response);
    intents.forEach(async (i, index) => {
      const intentUri = url + "/" + i.id;
      if(i.name.includes("faq_")) await deleteIntent(intentUri, configGetIntents.LUIS_subscriptionKey, 2000 * index, () => {});
    });
  });
}

const deleteIntent = async (intentUri, subscriptionKey, ms, callback) => {
  await timeout(ms);
  return new Promise((resolve, reject) => {
    request.delete(
      {
        url: intentUri,
        headers: {
          'Ocp-Apim-Subscription-Key': subscriptionKey
        }
      },
      (err) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        if (callback) {
          console.log(intentUri)
          callback();
        }
        resolve();
      }
    );
  });
}

const timeout = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}


const getIntents = async (url, subscriptionKey, callback) => {
  return new Promise((resolve, reject) => {
    request.get(
      {
        url: url,
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          'Ocp-Apim-Subscription-Key': subscriptionKey
        }
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