const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { readdir, stat, rename } = require('fs/promises'); // Import rename here
const chalk = require('chalk');

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
        // Construct the source and destination folder paths
        const sourceFolderPath = path.join(subFolderPath, oldMasterLocale);
        const destinationFolderPath = path.join(subFolderPath, newMasterLocale);

        // Check if the source folder exists and destination folder does not
        const sourceExists = fs.existsSync(sourceFolderPath);
        const destinationExists = fs.existsSync(destinationFolderPath);

        if (sourceExists && !destinationExists) {
          // Rename "en-us" to "en"
          await rename(sourceFolderPath, destinationFolderPath);
          console.log(
            `Renamed ${oldMasterLocale} to ${newMasterLocale} in ${subFolder}`
          );
        } else if (sourceExists && destinationExists) {
          // Move files between folders if both exist
          const tempFolderPath = path.join(subFolderPath, 'temp-locale');
          fs.mkdirSync(tempFolderPath, { recursive: true });

          const moveFiles = async (sourcePath, destinationPath) => {
            const files = await readdir(sourcePath);
            for (const file of files) {
              const srcFilePath = path.join(sourcePath, file);
              const destFilePath = path.join(destinationPath, file);
              await rename(srcFilePath, destFilePath);
            }
          };

          // Move files from "en" to "temp-locale"
          await moveFiles(destinationFolderPath, tempFolderPath);

          // Move files from "en-us" to "en"
          await moveFiles(sourceFolderPath, destinationFolderPath);

          // Move files from "temp-locale" to "en-us"
          await moveFiles(tempFolderPath, sourceFolderPath);

          // Remove the temp-locale folder
          fs.rmdirSync(tempFolderPath, { recursive: true });

          console.log(
            `Swapped contents of ${oldMasterLocale} and ${newMasterLocale} in ${subFolder}`
          );

          // Introduce a 5-second delay before calling entryReplaceLoc()
          setTimeout(() => {
            entryReplaceLoc(
              destinationFolderPath,
              newMasterLocale,
              oldMasterLocale
            );

            console.log(
              'Replaced old master-locale "',
              chalk.green(`${oldMasterLocale}`),
              '" with new master-locale "',
              chalk.green(`${newMasterLocale}`),
              '" in "',
              chalk.green(`${subFolder}`),
              '" content-type'
            );
          }, 5000); // 5000 milliseconds = 5 seconds
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
