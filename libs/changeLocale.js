// package import
const path = require('path');
const chalk = require('chalk');

// local import
const helper = require('../utils/helper');
const copyChildFolderIfNotExists = require('./copyChildFolderIfNotExists');
const changeFallbackLocale = require('./changeFallbackLocale');
const saveOldMasterLocale = require('./saveOldMasterLocale');
const createMasterLocale = require('./createMasterLocale');

// this function is used as too many repeated functions are there
const repeatedFunction = async (
  localeData,
  newMasterLocale,
  newMasterLocaleName,
  oldMasterCode,
  oldMasterLocaleName,
  oldMasterLocale,
  folderPath
) => {
  // to save the old master locale into locales.json file
  saveOldMasterLocale(
    localeData,
    oldMasterCode,
    newMasterLocale,
    oldMasterLocaleName,
    folderPath
  );

  // to create new master locale when there is no locale present in the locales.json file and create a new master locale inside the master-locales.json file
  createMasterLocale(
    oldMasterLocale,
    newMasterLocale,
    newMasterLocaleName,
    folderPath
  );

  // to create new master locale inside the entries folder if not present
  await copyChildFolderIfNotExists(folderPath, newMasterLocale, oldMasterCode);
};

module.exports = replaceLocale = (
  newMasterLocale,
  newMasterLocaleName,
  folderPath
) => {
  return new Promise(async (resolve, reject) => {
    let oldMasterLocale = helper.readFile(
      path.join(folderPath, 'locales', 'master-locale.json')
    );
    try {
      const localeData = helper.readFile(
        path.join(folderPath, 'locales', 'locales.json')
      );
      const oldMasterCode = Object.values(oldMasterLocale)[0]?.code;
      const oldMasterLocaleName = Object.values(oldMasterLocale)[0]?.name;

      // to check if locales.json file is empty or not
      if (Object.keys(localeData).length === 0) {
        // to check if the newMasterLocale and oldMasterLocale is same or not
        if (String(newMasterLocale) === String(oldMasterCode)) {
          console.log(
            '"',
            chalk.red(`${newMasterLocale}`),
            '" is already the master locale'
          );
        } else {
          repeatedFunction(
            localeData,
            newMasterLocale,
            newMasterLocaleName,
            oldMasterCode,
            oldMasterLocaleName,
            oldMasterLocale,
            folderPath
          );

          console.log(
            'New master locale change to "',
            chalk.green(`${newMasterLocale}`),
            '" from "',
            chalk.red(`${oldMasterCode}`),
            '"'
          );
        }
      } else {
        for (const localeCode of Object.values(localeData)) {
          // to check if new master locale is in the locales.json or not
          if (localeCode.code === newMasterLocale) {
            createMasterLocale(
              oldMasterLocale,
              newMasterLocale,
              newMasterLocaleName,
              folderPath
            );

            // to change fallback of oldmasterlocale to newmasterlocale
            changeFallbackLocale(
              localeData,
              Object.values(oldMasterLocale)[0]?.code,
              newMasterLocale,
              folderPath
            );

            for (let oldLocaleCode in localeData) {
              if (localeData.hasOwnProperty(oldLocaleCode)) {
                if (localeData[oldLocaleCode].code === newMasterLocale) {
                  localeData[oldLocaleCode].code = newMasterLocale;
                  localeData[oldLocaleCode].name = newMasterLocaleName;
                }
              }
            }

            helper.writeFile(
              path.join(folderPath, 'locales', 'locales.json'),
              JSON.stringify(localeData, null, 4)
            );
          } else {
            repeatedFunction(
              localeData,
              newMasterLocale,
              newMasterLocaleName,
              oldMasterCode,
              oldMasterLocaleName,
              oldMasterLocale,
              folderPath
            );

            // to change fallback of oldmasterlocale to newmasterlocale
            changeFallbackLocale(
              localeData,
              oldMasterCode,
              newMasterLocale,
              folderPath
            );
          }
        }
        console.log(
          'New master locale change to "',
          chalk.green(`${newMasterLocale}`),
          '" from "',
          chalk.red(`${oldMasterCode}`),
          '"'
        );
      }

      // Introduce a 5-second delay before resolving the promise
      setTimeout(() => {
        resolve();
      }, 5000);
    } catch (error) {
      console.error(error);
      reject();
    }
  });
};
