const path = require('path');
const fs = require('fs').promises;
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const helper = require('../utils/helper');

module.exports = async function changeVariantLocale(
  folderPath,
  newMasterLocale,
  oldMasterLocale
) {
  try {
    // Read the contents of the Entry  folder
    const entriesFiles = await fs.readdir(folderPath);

    for (const entryFile of entriesFiles) {
      // Construct the path to the random folder
      const randomFolderPath = path.join(folderPath, entryFile);

      // Read the files in the random folder of variant folder
      const files = await fs.readdir(randomFolderPath);

      // filter files array which we don't need
      const filterEntriesFiles = ['index.json'];

      // to get the filter data from the Entry and Assets folder
      const uniqueEntryList = files.filter(
        (value) => !filterEntriesFiles.includes(value)
      );

      for (const variantFile of uniqueEntryList) {
        const entryData = helper.readFile(
          path.join(randomFolderPath, variantFile)
        );
        // Update the locale fields
        entryData.forEach((entry) => {
          // Update the top-level `locale` field
          if (entry.locale === oldMasterLocale) {
            entry.locale = newMasterLocale;
          }

          // Update the `publish_details` array
          entry.publish_details.forEach((publishDetail) => {
            if (publishDetail.locale === oldMasterLocale) {
              publishDetail.locale = newMasterLocale;
            }
          });
        });

        // saving the new masterlocale publish detail inside the entries and assets original json file
        helper.writeFile(
          path.join(randomFolderPath, variantFile),
          JSON.stringify(entryData, null, 4)
        );
      }
    }
  } catch (error) {
    console.error(error);
  }
};
