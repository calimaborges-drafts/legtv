describe("rar utility", () => {
  it("should list rar files", async () => {
    const { rar } = require("./");
    const archive = await rar(
      `${__dirname}/../../test_files/legendas_tv_20171023171351000000.rar`
    );
    expect(archive.list()).toEqual(
      expect.arrayContaining([
        "The.Walking.Dead.S08E01.Mercy.1080p.AMZN.WEBRip.DDP5.1.x264.srt",
        "The.Walking.Dead.S08E01.Mercy.720p.AMZN.WEBRip.DDP5.1.x264.srt",
        "Legendas.tv.url"
      ])
    );
  });
});
