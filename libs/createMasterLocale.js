const path = require('path');
const helper = require('../utils/helper');

// to replace all the old master locale present inside the master-locale.json file
module.exports = function createMasterLocale(
  masterLocale,
  newMasterLocale,
  newMasterLocaleName,
  folderPath
) {
  for (let key in masterLocale) {
    if (masterLocale.hasOwnProperty(key)) {
      // Modify 'code' and 'name' fields
      masterLocale[key].code = newMasterLocale;
      masterLocale[key].name = newMasterLocaleName;
    }
  }
  // saving the new masterlocale file inside the locale.json
  helper.writeFile(
    path.join(folderPath, 'locales', 'master-locale.json'),
    JSON.stringify(masterLocale, null, 4)
  );
};
