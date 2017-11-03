const http = require("http");
const fetch = require("isomorphic-fetch");
const normalizeUri = require("normalize-uri");
const cheerio = require("cheerio");
const tmp = require("tmp-promise");
const fs = require("fs-extra");
const Promise = require("bluebird");

const { rar } = require("./rar-wrapper");

const legendasTvProtocol = "http";
const legendasTvHost = "legendas.tv";

const loginLegendasTv = async (username, password) => {
  const response = await fetch(
    `${legendasTvProtocol}://${legendasTvHost}/login`,
    {
      method: "post",
      headers: {
        "content-type": "application/x-www-form-urlencoded"
      },
      body: `data[User][username]=${username}&data[User][password]=${password}`,
      redirect: "manual"
    }
  );

  const cookies = response.headers.getAll("set-cookie");
  const cookiesFilteredByAuth = cookies.filter(
    cookie => cookie.indexOf("au") !== -1
  );

  if (cookiesFilteredByAuth.length < 1) throw new Error("Login failed");
  const authSetCookie = cookiesFilteredByAuth[0];
  const authCookie = authSetCookie.split(";")[0];

  return authCookie;
};

const searchLegendasTv = async query => {
  const queryStr = normalizeUri(query);
  const response = await fetch(
    `${legendasTvProtocol}://${legendasTvHost}/legenda/busca/${queryStr}/1`
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

const downloadFromLegendasTv = async (authCookie, id) => {
  const url = `${legendasTvProtocol}://${legendasTvHost}/downloadarquivo/${id}`;
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
  return tempPath;
};

const listSubtitlesFromRarFile = async path => {
  const archive = await rar(path);
  return archive.list().filter(file => file.endsWith(".srt"));
};

const querySubtitlesFromLegendasTv = async (username, password, query) => {
  const authCookie = await loginLegendasTv(username, password);
  const topLinks = await searchLegendasTv(query);

  return await Promise.reduce(
    topLinks,
    async (listOfSubtitles, link) => {
      const filePath = await downloadFromLegendasTv(authCookie, link);
      const currentSubtitleFiles = await listSubtitlesFromRarFile(filePath);
      return [
        ...listOfSubtitles,
        ...currentSubtitleFiles.map(subtitleFile => ({
          name: subtitleFile,
          container: filePath
        }))
      ];
    },
    []
  );
};

module.exports = {
  loginLegendasTv,
  searchLegendasTv,
  downloadFromLegendasTv,
  querySubtitlesFromLegendasTv,
  listSubtitlesFromRarFile
};
