const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const chalk = require('chalk');

// Promisify fs functions for asynchronous usage
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const helper = require('./helper');

// to replace all the old master locale present inside the entries.json
module.exports = async function copyChildFolderIfNotExists(
  folderPath,
  newMasterLocale,
  oldMasterLocale
) {
  try {
    // Read the contents of the Entry folder
    const subFolders = await readdir(folderPath);

    // Iterate through subfolders
    for (const subFolder of subFolders) {
      const subFolderPath = path.join(folderPath, subFolder);
      // Check if it's a directory

      const subFolderStat = await stat(subFolderPath);
      if (subFolderStat.isDirectory()) {
        // Construct the destination folder path
        const sourceFolderPath = path.join(subFolderPath, oldMasterLocale);
        // Check if the folder to copy exists
        const destinationFolderPath = path.join(subFolderPath, newMasterLocale);

        try {
          // Check if the folder to copy exists
          await stat(destinationFolderPath);
        } catch (err) {
          if (err.code === 'ENOENT') {
            // to check if the old masterlocale entry exist or not
            if (fs.existsSync(sourceFolderPath)) {
              // Folder doesn't exist, so copy it
              fs.cpSync(sourceFolderPath, destinationFolderPath, {
                recursive: true,
              });

              // Introduce a 5-second delay before calling entryReplaceLoc()
              setTimeout(() => {
                // to replace oldMasterLocale from the publish details in destinationFolderPath
                entryReplaceLoc(
                  destinationFolderPath,
                  newMasterLocale,
                  oldMasterLocale
                );

                console.log(
                  'Created new master-locale "',
                  chalk.green(`${newMasterLocale}`),
                  '" entry in "',
                  chalk.green(`${subFolder}`),
                  '" content-type'
                );
              }, 5000); // 5000 milliseconds = 5 seconds
            } else {
              console.log('hey else');
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
};

async function entryReplaceLoc(folderPath, newMasterLocale, oldMasterLocale) {
  try {
    // Read the contents of the Entry folder
    const entriesFiles = await readdir(folderPath);

    // filter files array which we don't need
    const filterEntriesFiles = ['index.json'];

    // to get the filter data from the Entry folder
    const uniqueEntryList = entriesFiles.filter(
      (value) => !filterEntriesFiles.includes(value)
    );

    for (const entryFile of uniqueEntryList) {
      const entryData = helper.readFile(path.join(folderPath, entryFile));

      for (const key in entryData) {
        if (entryData[key].publish_details.length > 0) {
          entryData[key].publish_details.forEach((detail, index) => {
            if (
              detail.locale === oldMasterLocale &&
              detail.locale !== newMasterLocale
            ) {
              const newMasterLocaleJSON = {
                ...detail,
                locale: newMasterLocale,
              };
              entryData[key].publish_details.splice(
                index + 1,
                0,
                newMasterLocaleJSON
              );
            }
          });
        }
      }

      // saving the new masterlocale publish detail inside the entries original json file
      helper.writeFile(
        path.join(folderPath, entryFile),
        JSON.stringify(entryData, null, 4)
      );
    }
  } catch (error) {
    console.log(error);
  }
}
