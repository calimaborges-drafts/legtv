const inquirer = require("inquirer");
const program = require("commander");
const { red } = require("chalk");
const ora = require("ora");

const { version } = require("../package.json");
const {
  loginLegendasTv,
  searchLegendasTv,
  listUnpackedFiles
} = require("./legendastv-api");

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

const askWhichFiles = async choices => {
  return inquirer.prompt({
    type: "checkbox",
    message: "Select which one(s) to download",
    name: "selectedFiles",
    choices
  });
};

const doMyThing = async query => {
  const { username, password } = await askForUsernameAndPassword();
  const spinner = ora("Authenticating").start();
  const authCookie = await loginLegendasTv(username, password);
  spinner.text = `Searching for "${query}"`;
  const ids = await searchLegendasTv(query);
  spinner.text = `Extracting results for "${query}"`;
  const files = await listUnpackedFiles(authCookie, ids);
  spinner.stop();
  const filesAnswer = await askWhichFiles(files);
  console.log(filesAnswer);
};

const main = async query => {
  if (!query) {
    throw new Error("query is required");
  } else {
    return doMyThing(query);
  }
};

let query;

program
  .version(version)
  .arguments("<query>")
  .action(argv1 => {
    query = argv1;
  });

program.parse(process.argv);

main(query).catch(error => {
  console.error(`${red(error)}`);
  process.exit(1);
});
