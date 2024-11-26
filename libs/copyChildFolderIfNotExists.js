const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const chalk = require('chalk');

// Promisify fs functions for asynchronous usage
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const createPublishLocale = require('./createPublishLocale');
const changeEnvironmentLocale = require('./changeEnvironmentLocale');
const changeWorkflowLocale = require('./changeWorkflowLocale');

// to replace all the old master locale present inside the entries.json
module.exports = async function copyChildFolderIfNotExists(
  folderPath,
  newMasterLocale,
  oldMasterLocale
) {
  try {
    // Read the contents of the Entry folder
    const subFolders = await readdir(path.join(folderPath, 'entries'));

    // Iterate through subfolders
    for (const subFolder of subFolders) {
      const subFolderPath = path.join(folderPath, 'entries', subFolder);
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
            if (
              fs.existsSync(sourceFolderPath) &&
              !fs.existsSync(destinationFolderPath)
            ) {
              // Folder doesn't exist, so copy it
              fs.cpSync(sourceFolderPath, destinationFolderPath, {
                recursive: true,
              });

              // Introduce a 5-second delay before calling required functions
              setTimeout(() => {
                if (fs.existsSync(path.join(folderPath, 'assets')))
                  // to replace oldMasterLocale from the publish details in destinationFolderPath of entries folder
                  createPublishLocale(
                    path.join(folderPath, 'assets'),
                    newMasterLocale,
                    oldMasterLocale
                  );

                // to replace oldMasterLocale from the publish details in assets folder
                createPublishLocale(
                  destinationFolderPath,
                  newMasterLocale,
                  oldMasterLocale
                );

                if (
                  fs.existsSync(
                    path.join(folderPath, 'environments', 'environments.json')
                  )
                )
                  // to replace oldMasterLocale from the environments json
                  changeEnvironmentLocale(
                    path.join(folderPath, 'environments', 'environments.json'),
                    newMasterLocale,
                    oldMasterLocale
                  );

                if (
                  fs.existsSync(
                    path.join(folderPath, 'workflows', 'workflows.json')
                  )
                )
                  // to replace oldMasterLocale from the environments json
                  changeWorkflowLocale(
                    path.join(folderPath, 'workflows', 'workflows.json'),
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
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
};
