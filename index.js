const glossaryConverter = require("./glossaryConverter");
const intentsImporter = require("./intentsImporter");

var args = process.argv.slice(2);
if (args) {
  switch (args[0]) {
    case "glossary":
      glossaryConverter.createDocument("Glossary-20180803.csv");
      break;
    case "intents":
      intentsImporter.importIntents();
      break;
    default:
      break;
  }
}
