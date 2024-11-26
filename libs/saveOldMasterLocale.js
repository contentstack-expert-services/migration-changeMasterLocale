const path = require('path');
const helper = require('../utils/helper');

// to save old master locale inside the locales.json file
module.exports = function saveOldMasterLocale(
  localeData,
  oldMasterLocale,
  newMasterLocale,
  oldMasterLocaleName,
  folderPath
) {
  let uid = `oldMasterlocale_${oldMasterLocale.replace(/-/g, '_')}`;
  localeData[uid] = {
    code: oldMasterLocale,
    fallback_locale: newMasterLocale,
    name: oldMasterLocaleName,
    uid: uid,
  };

  helper.writeFile(
    path.join(folderPath, 'locales', 'locales.json'),
    JSON.stringify(localeData, null, 4)
  );
};
