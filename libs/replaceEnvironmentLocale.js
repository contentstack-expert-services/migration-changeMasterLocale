const path = require('path');
const helper = require('../utils/helper');

module.exports = function replaceEnvironmentLocale(
  folderPath,
  newMasterLocale,
  oldMasterLocale
) {
  try {
    const environmentsLocale = helper.readFile(path.join(folderPath));

    // Iterate through the environmentsLocale object
    for (let key in environmentsLocale) {
      if (environmentsLocale[key].urls) {
        // Iterate through the urls array
        environmentsLocale[key].urls = environmentsLocale[key].urls.map(
          (entry) => {
            // Check if the locale matches oldMasterLocale and replace it
            if (entry.locale === oldMasterLocale) {
              entry.locale = newMasterLocale;
            }
            return entry;
          }
        );
      }
    }

    helper.writeFile(
      path.join(folderPath),
      JSON.stringify(environmentsLocale, null, 4)
    );
  } catch (error) {
    console.error(error);
  }
};
