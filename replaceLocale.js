const path = require('path');
const chalk = require('chalk');

const copyChildFolderIfNotExists = require('./entryReplaceLocale');
const helper = require('./helper');
const localeList = require('./locales.json');

module.exports = replaceLocale = (
  masterLocale,
  newMasterLocale,
  oldMasterLocale,
  folderPath
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const localeData = helper.readFile(
        path.join(folderPath, 'locales', 'locales.json')
      );
      // to check if locales.json file is empty or not
      if (Object.keys(localeData).length === 0) {
        // to check if the newMasterLocale and oldMasterLocale is same or not
        if (newMasterLocale === oldMasterLocale) {
          console.log(
            '"',
            chalk.red(`${newMasterLocale}`),
            '" is already the master locale'
          );
        } else {
          createMasterLocale(masterLocale, newMasterLocale, folderPath);

          // to save the old master locale into locales.json file
          saveOldMasterLocale(
            localeData,
            oldMasterLocale,
            newMasterLocale,
            folderPath
          );
          await copyChildFolderIfNotExists(
            path.join(folderPath, 'entries'),
            newMasterLocale,
            oldMasterLocale
          );
          console.log(
            'New master locale change to "',
            chalk.green(`${newMasterLocale}`),
            '" from "',
            chalk.red(`${oldMasterLocale}`),
            '"'
          );
        }
      } else {
        for (const localeCode of Object.values(localeData)) {
          // to check if new master locale is in the locales.json or not
          if (localeCode.code === newMasterLocale) {
            createMasterLocale(masterLocale, newMasterLocale, folderPath);

            // to change fallback of oldmasterlocale to newmasterlocale
            changeFallbackLocale(
              localeData,
              oldMasterLocale,
              newMasterLocale,
              folderPath
            );

            for (let oldLocaleCode in localeData) {
              if (localeData.hasOwnProperty(oldLocaleCode)) {
                if (localeData[oldLocaleCode].code === newMasterLocale) {
                  localeData[oldLocaleCode].code = newMasterLocale;
                  localeData[oldLocaleCode].name = localeList[newMasterLocale];
                }
              }
            }
            helper.writeFile(
              path.join(folderPath, 'locales', 'locales.json'),
              JSON.stringify(localeData, null, 4)
            );
          } else {
            createMasterLocale(masterLocale, newMasterLocale, folderPath);

            // to change fallback of oldmasterlocale to newmasterlocale
            changeFallbackLocale(
              localeData,
              oldMasterLocale,
              newMasterLocale,
              folderPath
            );

            // to save the old master locale into locales.json file
            saveOldMasterLocale(
              localeData,
              oldMasterLocale,
              newMasterLocale,
              folderPath
            );

            await copyChildFolderIfNotExists(
              path.join(folderPath, 'entries'),
              newMasterLocale,
              oldMasterLocale
            );
          }
        }
        console.log(
          'New master locale change to "',
          chalk.green(`${newMasterLocale}`),
          '" from "',
          chalk.red(`${oldMasterLocale}`),
          '"'
        );
      }

      // Introduce a 5-second delay before resolving the promise
      setTimeout(() => {
        resolve();
      }, 5000);
    } catch (error) {
      console.log(error);
      reject();
    }
  });
};

// to replace all the old master locale present inside the master-locale.json file
function createMasterLocale(masterLocale, newMasterLocale, folderPath) {
  for (let key in masterLocale) {
    if (masterLocale.hasOwnProperty(key)) {
      // Modify 'code' and 'name' fields
      masterLocale[key].code = newMasterLocale;
      masterLocale[key].name = localeList[newMasterLocale];
    }
  }
  // saving the new masterlocale file inside the locale.json
  helper.writeFile(
    path.join(folderPath, 'locales', 'master-locale.json'),
    JSON.stringify(masterLocale, null, 4)
  );
}

// to save old master locale inside the locales.json file
function saveOldMasterLocale(
  localeData,
  oldMasterLocale,
  newMasterLocale,
  folderPath
) {
  localeData['oldermasterlocale'] = {
    code: oldMasterLocale,
    fallback_locale: newMasterLocale,
    name: localeList[oldMasterLocale],
    uid: 'oldermasterlocale',
  };

  helper.writeFile(
    path.join(folderPath, 'locales', 'locales.json'),
    JSON.stringify(localeData, null, 4)
  );
}

// to change fallback inside the locales.json
function changeFallbackLocale(
  localeData,
  oldMasterLocale,
  newMasterLocale,
  folderPath
) {
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
}
