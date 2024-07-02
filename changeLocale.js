const replaceLocale = require('./replaceLocale');
const helper = require('./helper');
const path = require('path');

const changeLocale = () => {
  const folderPath =
    '/Users/saurav.upadhyay/Expert Service/danfoss/csMigrationData/main';

  const localeData = helper.readFile(
    path.join(folderPath, 'locales', 'master-locale.json')
  );
  replaceLocale(localeData, 'en', 'en-us', folderPath);
};

changeLocale();
