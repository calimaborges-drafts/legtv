const inquirer = require("inquirer");
const program = require("commander");
const { red } = require("chalk");
const ora = require("ora");
// const { score } = require("fuzzaldrin");

const { version } = require("../../package.json");
const { login, search, download, extractSubtitles } = require("../legendastv");

const askForUsernameAndPassword = async () => {
  const usernameAndPasswordQuestions = [
    {
      type: "input",
      name: "username",
      message: "Username"
    },
    {
      type: "password",
      name: "password",
      message: "Password"
    }
  ];

  return inquirer.prompt(usernameAndPasswordQuestions);
};

const collectDataAndOutputSubtitles = async query => {
  const { username, password } = await askForUsernameAndPassword();
  const spinner = ora("Authenticating").start();
  try {
    const authCookie = await login(username, password);
    spinner.text = `Searching for "${query}"`;
    const ids = await search(query);
    spinner.text = `Downloading subtitle RAR files`;
    const downloadedFilePaths = await download(authCookie, ...ids);
    spinner.text = `Extracting RAR files`;
    const files = await extractSubtitles(".", ...downloadedFilePaths);
    spinner.stop();
    console.log("Done! :-)");
  } catch (err) {
    spinner.stop();
    console.error(err);
  }
};

const startCli = async () => {
  let query;

  program
    .version(version)
    .arguments("<query>")
    .action(argv1 => {
      query = argv1;
    });

  program.parse(process.argv);

  if (!query) {
    throw new Error("query is required");
  } else {
    return collectDataAndOutputSubtitles(query);
  }
};

module.exports = {
  startCli
};
