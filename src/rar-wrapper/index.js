const RarArchive = require("rarjs");

const rar = async path => {
  const archive = await new Promise((resolve, reject) => {
    const rarArchive = RarArchive(
      { type: RarArchive.OPEN_LOCAL, file: path },
      err => {
        if (err) reject(err);
        resolve(rarArchive);
      }
    );
  });

  const list = () => archive.entries.map(entry => entry.name);

  return {
    list
  };
};

module.exports = {
  rar
};
