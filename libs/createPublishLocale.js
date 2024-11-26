const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);

const helper = require('../utils/helper');
const changeVariantLocale = require('./changeVariantLocale');

module.exports = async function createPublishLocale(
  folderPath,
  newMasterLocale,
  oldMasterLocale
) {
  try {
    // Read the contents of the Entry and Assets folder
    const entriesFiles = await readdir(folderPath);

    // this function is only written to change old masterlocale of variant to new masterlocale
    if (fs.existsSync(path.join(folderPath, 'variants'))) {
      await changeVariantLocale(
        path.join(folderPath, 'variants'),
        newMasterLocale,
        oldMasterLocale
      );
    }

    // filter files array which we don't need
    const filterEntriesFiles = [
      'index.json',
      'folders.json',
      'assets.json',
      'files',
      'metadata.json',
      'variants',
    ];

    // to get the filter data from the Entry and Assets folder
    const uniqueEntryList = entriesFiles.filter(
      (value) => !filterEntriesFiles.includes(value)
    );

    for (const entryFile of uniqueEntryList) {
      const entryData = helper.readFile(path.join(folderPath, entryFile));

      for (const key in entryData) {
        // Update the top-level `locale` field
        if (entryData[key]?.locale === oldMasterLocale) {
          entryData[key].locale = newMasterLocale;
        }

        // Check if `publish_details` exists and has entries
        if (
          entryData[key]?.publish_details &&
          entryData[key]?.publish_details.length > 0
        ) {
          // Create a map of unique combinations for deduplication
          const uniqueDetails = {};
          entryData[key].publish_details.forEach((detail) => {
            const uniqueKey = `${detail.environment}-${detail.locale}`;
            if (!uniqueDetails[uniqueKey]) {
              uniqueDetails[uniqueKey] = detail;
            }
          });

          // Replace `publish_details` with unique values
          const uniqueDetailsArray = Object.values(uniqueDetails);

          // Ensure a new locale is created for each unique environment
          uniqueDetailsArray.forEach((detail) => {
            if (detail.locale === oldMasterLocale) {
              const newMasterLocaleJSON = {
                ...detail,
                locale: newMasterLocale,
              };
              const newKey = `${newMasterLocaleJSON.environment}-${newMasterLocaleJSON.locale}`;
              if (!uniqueDetails[newKey]) {
                uniqueDetails[newKey] = newMasterLocaleJSON;
              }
            }
          });

          // Assign back the updated unique `publish_details`
          entryData[key].publish_details = Object.values(uniqueDetails);
        }
      }

      // Save the updated data back to the file
      helper.writeFile(
        path.join(folderPath, entryFile),
        JSON.stringify(entryData, null, 4)
      );
    }
  } catch (error) {
    console.error(error);
  }
};
