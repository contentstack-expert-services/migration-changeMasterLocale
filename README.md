# Change Master-locale

### Steps to follow to change master-locale


1. Copy the repository to your local computer.
2. Use the Contentstack CLI commands to export the stack data; follow the link: [export-content-using-the-cli](https://www.contentstack.com/docs/developers/cli/export-content-using-the-cli)
3. The following commands must be run to install the necessary npm modules:

   ```
   npm i
   ```
4. Run the index.js file once the package has been installed.

   ```
   node index.js
   ```
5. Enter the folder path where you exported the data along with the branch name.
6. To find out which master locale code the user wants, enter it and click the link: ⁣[list-of-supported-languages](https://www.contentstack.com/docs/developers/multilingual-content/list-of-supported-languages)
7. Once the master locale has been successfully changed, use the Contentstack CLI import commands to import the data into Contentstack; click this link: ⁣[import-content-using-the-cli](https://www.contentstack.com/docs/developers/cli/import-content-using-the-cli)
