const fetch = require("isomorphic-fetch");
const normalizeUri = require("normalize-uri");
const cheerio = require("cheerio");
const tmp = require("tmp-promise");
const fs = require("fs-extra");

const { rar } = require("../rar");

const protocol = "http";
const host = "legendas.tv";

const login = async (username, password) => {
  const response = await fetch(`${protocol}://${host}/login`, {
    method: "post",
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    body: `data[User][username]=${username}&data[User][password]=${password}`,
    redirect: "manual"
  });

  const cookies = response.headers.getAll("set-cookie");
  const cookiesFilteredByAuth = cookies.filter(
    cookie => cookie.indexOf("au") !== -1
  );

  if (cookiesFilteredByAuth.length < 1) throw new Error("Login failed");
  const authSetCookie = cookiesFilteredByAuth[0];
  const authCookie = authSetCookie.split(";")[0];

  return authCookie;
};

const search = async query => {
  const queryStr = normalizeUri(query);
  const response = await fetch(
    `${protocol}://${host}/legenda/busca/${queryStr}/1`
  );
  const text = await response.text();
  const html = cheerio.load(text);

  return html("article a")
    .map(function(i, el) {
      return html(this).attr("href");
    })
    .get()
    .filter(href => href.indexOf("download") !== -1)
    .map(link => {
      const matchedLink = link.match(/\/download\/([a-z0-9]+)\/.*/);
      if (!matchedLink) return null;
      else return matchedLink[1];
    })
    .filter(id => id !== null)
    .slice(0, 3);
};

const download = async (authCookie, ...ids) => {
  const successfullyDownloaded = [];
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const url = `${protocol}://${host}/downloadarquivo/${id}`;
    try {
      const response = await fetch(url, {
        headers: {
          ["user-agent"]:
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36",
          cookie: authCookie
        }
      });
      const fileBuffer = await response.buffer();
      const tempFile = await tmp.file();
      const tempPath = tempFile.path;
      await fs.writeFile(tempPath, fileBuffer);
      await rar(tempPath);
      successfullyDownloaded.push(tempPath);
    } catch (err) {
      console.error(err);
    }
  }

  return successfullyDownloaded.length == 1
    ? successfullyDownloaded[0]
    : successfullyDownloaded;
};

const extractSubtitles = async (pathToExtractTo, ...rarFilePaths) => {
  for (let i = 0; i < rarFilePaths.length; i++) {
    const rarFilePath = rarFilePaths[i];
    const archive = await rar(rarFilePath);
    await archive.extractTo(pathToExtractTo, file => file.endsWith(".srt"));
  }
};

module.exports = {
  login,
  search,
  download,
  extractSubtitles
};
