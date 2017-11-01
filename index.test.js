describe("legendas tv unofficial api", () => {
  const authHeader = null;

  it("should be able to search subtitles", async () => {
    const { searchLegendasTv } = require("./");

    const topLinks = await searchLegendasTv("the walking dead");
    topLinks.forEach(link =>
      expect(link.toLowerCase()).toContain("the_walking_dead")
    );
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
    const response = await downloadFromLegendasTv(
      authCookie,
      "downloadarquivo/59ee3f6e88cee"
    );

    const fileSize = 17386;
    expect(response.length).toBe(fileSize);
  });
});
