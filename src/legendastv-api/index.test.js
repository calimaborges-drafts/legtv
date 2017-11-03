describe("legendas tv unofficial api", () => {
  const authHeader = null;
  const testId = "59ee3f6e88cee";

  it("should be able to search subtitles", async () => {
    const { searchLegendasTv } = require("./");

    const topLinks = await searchLegendasTv("the walking dead");
    topLinks.forEach(link => expect(link).toMatch(/[a-f0-9]+/));
  });

  it("should be able to login and download file", async () => {
    const { LEGENDAS_TV_PASSWORD, LEGENDAS_TV_USERNAME } = process.env;
    if (!LEGENDAS_TV_USERNAME || !LEGENDAS_TV_PASSWORD)
      throw new Error(
        "Test require LEGENDAS_TV_USERNAME and LEGENDAS_TV_PASSWORD environment variable"
      );
    const { loginLegendasTv, downloadFromLegendasTv } = require("./");
    const authCookie = await loginLegendasTv(
      process.env.LEGENDAS_TV_USERNAME,
      process.env.LEGENDAS_TV_PASSWORD
    );

    expect(authCookie).toBeTruthy();
    const filePath = await downloadFromLegendasTv(authCookie, testId);
    const fs = require("fs-extra");
    const fileStat = await fs.stat(filePath);
    const fileSize = 17386;
    expect(fileStat.size).toBe(fileSize);
  });

  it("should list available subtitles inside .rar file", async () => {
    const { listSubtitlesFromRarFile } = require("./");
    const fs = require("fs-extra");

    const files = await listSubtitlesFromRarFile(
      `${__dirname}/../../test_files/legendas_tv_20171023171351000000.rar`
    );

    expect(files).toEqual(
      expect.arrayContaining([
        "The.Walking.Dead.S08E01.Mercy.720p.AMZN.WEBRip.DDP5.1.x264.srt",
        "The.Walking.Dead.S08E01.Mercy.1080p.AMZN.WEBRip.DDP5.1.x264.srt"
      ])
    );

    expect(files).not.toContain("Legendas.tv.url");
  });

  it("should search and return list top 3 rar files SRTs", async () => {
    jest.setTimeout(10000);
    const { LEGENDAS_TV_PASSWORD, LEGENDAS_TV_USERNAME } = process.env;
    if (!LEGENDAS_TV_USERNAME || !LEGENDAS_TV_PASSWORD)
      throw new Error(
        "Test require LEGENDAS_TV_USERNAME and LEGENDAS_TV_PASSWORD environment variable"
      );

    const { querySubtitlesFromLegendasTv } = require("./");
    const list = await querySubtitlesFromLegendasTv(
      LEGENDAS_TV_USERNAME,
      LEGENDAS_TV_PASSWORD,
      "The Walking Dead S08E01"
    );

    expect(list.length).toBeGreaterThan(3);
  });
});
