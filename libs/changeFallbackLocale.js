const path = require('path');
const helper = require('../utils/helper');

module.exports = function changeFallbackLocale(
  localeData,
  oldMasterLocale,
  newMasterLocale,
  folderPath
) {
try {
    // Iterate through the localeData object
    for (let oldFallback in localeData) {
      if (localeData.hasOwnProperty(oldFallback)) {
        
        if (localeData[oldFallback].fallback_locale === oldMasterLocale) {
          localeData[oldFallback].fallback_locale = newMasterLocale;
        
        }
      }
    }

    helper.writeFile(
      path.join(folderPath, 'locales', 'locales.json'),
      JSON.stringify(localeData, null, 4)
    );
} catch (error) {
  console.error(error);
  
}
};
