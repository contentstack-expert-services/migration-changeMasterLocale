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
  const localeData = helper.readFile(
    path.join(folderPath, 'locales', 'locales.json')
  );

  for (const key of Object.values(localeData)) {
    if (key.code === newMasterLocale) {
      key.code = oldMasterLocale;
      key.name = oldMasterLocaleName;
      key.fallback_locale = newMasterLocale;
    } else {
      let uid = `oldMasterlocale_${oldMasterLocale.replace(/-/g, '_')}`;
      localeData[uid] = {
        code: oldMasterLocale,
        fallback_locale: newMasterLocale,
        name: oldMasterLocaleName,
        uid: uid,
      };
    }
  }

  helper.writeFile(
    path.join(folderPath, 'locales', 'locales.json'),
    JSON.stringify(localeData, null, 4)
  );
};
