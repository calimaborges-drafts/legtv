describe("rar utility", () => {
  it("should list rar files", async () => {
    const { rar } = require("./");
    const archive = await rar(
      `${__dirname}/../../test_files/legendas_tv_20171023171351000000.rar`
    );

    expect(await archive.list()).toEqual(
      expect.arrayContaining([
        "The.Walking.Dead.S08E01.Mercy.1080p.AMZN.WEBRip.DDP5.1.x264.srt",
        "The.Walking.Dead.S08E01.Mercy.720p.AMZN.WEBRip.DDP5.1.x264.srt",
        "Legendas.tv.url"
      ])
    );
  });

  it("should extract rar files", async () => {
    const tmp = require("tmp-promise");
    const fs = require("fs-extra");
    const { rar } = require("./");
    const archive = await rar(
      `${__dirname}/../../test_files/legendas_tv_20171023171351000000.rar`
    );

    const tempDir = (await tmp.dir()).path;
    await archive.extractTo(tempDir, file => file.endsWith("url"));
    const files = await fs.readdir(tempDir);
    expect(files).toEqual(expect.arrayContaining(["Legendas.tv.url"]));
    expect(files).not.toContain(
      "The.Walking.Dead.S08E01.Mercy.1080p.AMZN.WEBRip.DDP5.1.x264.srt"
    );
    expect(files).not.toContain(
      "The.Walking.Dead.S08E01.Mercy.720p.AMZN.WEBRip.DDP5.1.x264.srt"
    );
  });
});
