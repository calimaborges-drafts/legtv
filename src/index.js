const { red } = require("chalk");
const { startCli } = require("./cli");

startCli().catch(error => {
  console.error(red(error));
  process.exit(1);
});
