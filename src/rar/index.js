const rar = require("@fknop/node-unrar");
const fs = require("fs-extra");

const rarWrapper = async rarFilePath => {
  const list = async () =>
    new Promise((resolve, reject) =>
      rar.list(rarFilePath, {}, (err, results) => {
        if (err) reject(err);
        resolve(results.files);
      })
    );

  const extractTo = async (pathToExtractTo, filterFunction) =>
    new Promise((resolve, reject) => {
      rar.extract(
        rarFilePath,
        { dest: pathToExtractTo },
        async (err, results) => {
          if (err) reject(err);
          const filtered = results.files.filter(file => !filterFunction(file));
          for (let i = 0; i < filtered.length; i++) {
            const file = filtered[i];
            await fs.unlink(`${pathToExtractTo}/${file}`);
          }
          resolve(results.files.filter(filterFunction));
        }
      );
    });

  return {
    list,
    extractTo
  };
};

module.exports = {
  rar: rarWrapper
};
