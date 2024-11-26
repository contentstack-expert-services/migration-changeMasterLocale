const path = require('path');
const helper = require('../utils/helper');

module.exports = function changeEnvironmentLocale(
  folderPath,
  newMasterLocale,
  oldMasterLocale
) {
  try {
    const environmentsLocale = helper.readFile(path.join(folderPath));

    // Iterate through the environmentsLocale object
    for (let key in environmentsLocale) {
      if (environmentsLocale[key].urls) {
        const urls = environmentsLocale[key].urls;

        // Check if newMasterLocale already exists
        const newLocaleExists = urls.some(
          (entry) => entry.locale === newMasterLocale
        );

        // If newMasterLocale does not exist, add it
        if (!newLocaleExists) {
          // Find all entries with oldMasterLocale and duplicate them with newMasterLocale
          urls.forEach((entry) => {
            if (entry.locale === oldMasterLocale) {
              urls.push({
                ...entry, // Copy all properties of the old entry
                locale: newMasterLocale, // Change only the locale
              });
            }
          });
        }

        // Ensure there are no duplicates
        environmentsLocale[key].urls = urls.filter(
          (entry, index, self) =>
            index === self.findIndex((e) => e.locale === entry.locale)
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
