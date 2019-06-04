// uploading extra-info to IBM cloudant
const fs = require("fs");
const utils = require("./utils");
const common = require("./extra_info_common.json");
const carousel = require("./extra_info_carousel.json");
const icons = require("./extra_info_icons.json");
const table = require("./extra_info_table.json");

const ACCOUNT = "5c412650-c860-4841-8589-c410d2ffd8ca-bluemix";
const PASSWORD =
  "ed49c2a51fa87d9ae8ce00423577a1de78a856529dfa9901cf163899e3c1d77a";
const EXTRA_INFO_DB = "extra_info_all";
const extraInfoUrl =
  "https://" +
  ACCOUNT +
  ":" +
  PASSWORD +
  "@" +
  ACCOUNT +
  ".cloudant.com/" +
  EXTRA_INFO_DB;

exports.upload = async () => {
  const docsMap = {};
  const docs = common.concat(carousel, icons, table);
  docs.forEach(doc => {
    if (!docsMap[doc.id]) {
      docsMap[doc.id] = {
        _id: doc.id,
        intent: doc.intent,
        data: [
          {
            order: doc.order,
            type: doc.type,
            value: doc.value
          }
        ]
      };
    } else {
      docsMap[doc.id].data.push({
        order: doc.order,
        type: doc.type,
        value: doc.value
      });
    }
  });


  utils.asyncForEach(Object.keys(docsMap), async key => {
    const jsonData = docsMap[key];
    await utils.sleep(100);
    const response = await utils.postJson(extraInfoUrl, jsonData);
    console.log(response);
  });
};
