const path = require('path');
const helper = require('../utils/helper');

module.exports = function changeWorkflowLocale(
  folderPath,
  newMasterLocale,
  oldMasterLocale
) {
  try {
    const workflowLocale = helper.readFile(path.join(folderPath));

    // Iterate through the workflowLocale object
    for (let key in workflowLocale) {
      const workflow = workflowLocale[key];

      // Traverse nested objects and look for `master_locale`
      if (workflow.workflow_stages) {
        workflow.workflow_stages.forEach((stage) => {
          if (stage?.SYS_ACL?.roles?.uids) {
            stage?.SYS_ACL?.roles.uids.forEach((role) => {
              if (role.stack?.master_locale === oldMasterLocale) {
                // Replace oldMasterLocale with newMasterLocale
                role.stack.master_locale = newMasterLocale;
              }
            });
          }
        });
      }
    }

    helper.writeFile(
      path.join(folderPath),
      JSON.stringify(workflowLocale, null, 4)
    );
  } catch (error) {
    console.error(error);
  }
};
