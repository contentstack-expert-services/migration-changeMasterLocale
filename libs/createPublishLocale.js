const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);

const helper = require('../utils/helper');

module.exports = async function createPublishLocale(
  folderPath,
  newMasterLocale,
  oldMasterLocale
) {
  try {
    // Read the contents of the Entry and Assets folder
    const entriesFiles = await readdir(folderPath);

    // filter files array which we don't need
    const filterEntriesFiles = [
      'index.json',
      'folders.json',
      'assets.json',
      'files',
    ];

    // to get the filter data from the Entry and Assets folder
    const uniqueEntryList = entriesFiles.filter(
      (value) => !filterEntriesFiles.includes(value)
    );

    for (const entryFile of uniqueEntryList) {
      const entryData = helper.readFile(path.join(folderPath, entryFile));

      for (const key in entryData) {
        // check if the publish_details is present or not
        if (
          entryData[key]?.publish_details &&
          entryData[key]?.publish_details.length > 0
        ) {
          entryData[key]?.publish_details.forEach((detail, index) => {
            // check if the locale is old master locale and not the new master locale
            if (
              detail.locale === oldMasterLocale &&
              detail.locale !== newMasterLocale
            ) {
              const newMasterLocaleJSON = {
                ...detail,
                locale: newMasterLocale,
              };
              entryData[key]?.publish_details.splice(
                index + 1,
                0,
                newMasterLocaleJSON
              );
            }
          });
        } else {
        }
      }

      // saving the new masterlocale publish detail inside the entries and assets original json file
      helper.writeFile(
        path.join(folderPath, entryFile),
        JSON.stringify(entryData, null, 4)
      );
    }
  } catch (error) {
    console.error(error);
  }
};
