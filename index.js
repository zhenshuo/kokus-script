const glossaryConverter = require("./glossaryConverter");
const intentsImporter = require("./intentsImporter");
const intentsDelete = require("./intentsDelete");

var args = process.argv.slice(2);
if (args) {
  switch (args[0]) {
    case "glossary":
    // uploading glossary to IBM cloudant
      glossaryConverter.createDocument("Glossary20180928.csv");
      break;
    case "import-intents":
      intentsImporter.importIntents();
      break;
    case "delete-intents":
      intentsDelete.deleteIntents();
      break;
    default:
      break;
  }
}
