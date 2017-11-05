describe("legendas tv unofficial api", () => {
  let authCookie = null;
  const testIds = ["59ee3f6e88cee", "59f69507360f8", "59edf771d1d15"];

  beforeAll(async () => {
    const { LEGENDAS_TV_PASSWORD, LEGENDAS_TV_USERNAME } = process.env;
    if (!LEGENDAS_TV_USERNAME || !LEGENDAS_TV_PASSWORD)
      throw new Error(
        "Test require LEGENDAS_TV_USERNAME and LEGENDAS_TV_PASSWORD environment variable"
      );
    const { login } = require("./");
    authCookie = await login(LEGENDAS_TV_USERNAME, LEGENDAS_TV_PASSWORD);
  });

  it("should be able to search subtitles", async () => {
    const { search } = require("./");
    const topLinks = await search("the walking dead");
    topLinks.forEach(link => expect(link).toMatch(/[a-f0-9]+/));
  });

  it("should be able to download file", async () => {
    const { download } = require("./");
    const filePath = await download(authCookie, testIds[0]);
    const fs = require("fs-extra");
    const fileStat = await fs.stat(filePath);
    const fileSize = 17386;
    expect(fileStat.size).toBe(fileSize);
  });

  it("should be able to download multiple files", async () => {
    jest.setTimeout(10000);
    const { download } = require("./");
    const filePaths = await download(authCookie, ...testIds);
    const fs = require("fs-extra");
    for (let i = 0; i < filePaths.length; i++) {
      const filePath = filePaths[i];
      fs.access(filePath, fs.constants.F_OK);
    }
  });

  it("should extract only subtitles from .rar files", async () => {
    const { extractSubtitles } = require("./");
    const fs = require("fs-extra");
    const tmp = require("tmp-promise");
    const tempDir = (await tmp.dir()).path;
    await extractSubtitles(
      tempDir,
      `${__dirname}/../../test_files/legendas_tv_20171023171351000000.rar`
    );

    const files = await fs.readdir(tempDir);
    expect(files).toEqual(
      expect.arrayContaining([
        "The.Walking.Dead.S08E01.Mercy.720p.AMZN.WEBRip.DDP5.1.x264.srt",
        "The.Walking.Dead.S08E01.Mercy.1080p.AMZN.WEBRip.DDP5.1.x264.srt"
      ])
    );
    expect(files).not.toContain("Legendas.tv.url");
  });
});
