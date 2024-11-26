const inquirer = require('inquirer');
const chalk = require('chalk');
const axios = require('axios');
const fs = require('fs');

const executeReplaceLocale = require('./libs/executeReplaceLocale');

const migFunction = async (folderPath) => {
  const localErrorMessage =
    'Please enter the valid master locale code! or refer to this link: https://www.contentstack.com/docs/developers/multilingual-content/list-of-supported-languages';
  inquirer
    .prompt({
      type: 'input',
      name: 'masterLocale',
      message: 'Enter the new master locale code: ',
      validate: (masterLocale) => {
        if (!masterLocale || masterLocale.trim() === '') {
          console.log(chalk.red(localErrorMessage));
          return false;
        }
        this.name = masterLocale;
        return true;
      },
    })
    .then(async (answer) => {
      try {
        const response = await axios.get(
          'https://app.contentstack.com/api/v3/locales?include_all=true'
        );

        if (
          response?.data?.locales &&
          Object.hasOwn(response?.data?.locales, answer?.masterLocale)
        ) {
          executeReplaceLocale(
            answer.masterLocale,
            response?.data?.locales[answer.masterLocale],
            folderPath
          );
        } else {
          console.log(chalk.red(localErrorMessage));
          migFunction();
        }
      } catch (error) {
        console.error(error);
      }
    });
};

// to check if folder exist or not
const fileCheck = (folderPath) => {
  if (fs.existsSync(folderPath)) {
    migFunction(folderPath);
  } else {
    console.log(
      chalk.red(
        `Please check whether the entered details are correct or not and try again->`
      ),
      chalk.yellow(` "${folderPath}"`)
    );
    changeLocale();
  }
};

const changeLocale = () => {
  inquirer
    .prompt({
      type: 'input',
      name: 'folderPath',
      message: 'Enter the folder path: ',
      validate: (folderPath) => {
        if (!folderPath || folderPath.trim() === '') {
          console.log(chalk.red('Please insert folder path!'));
          return false;
        }
        this.name = folderPath;
        return true;
      },
    })
    .then(async (answer) => {
      fileCheck(answer.folderPath.replace(/\/$/, ''));
    });
};

changeLocale();
