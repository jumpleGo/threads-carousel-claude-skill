import { Config } from "@remotion/cli/config";

Config.setEntryPoint("src/remotion/index.ts");
Config.setVideoImageFormat("jpeg");
Config.setConcurrency(1);

const browserExec = process.env.REMOTION_CHROME_EXECUTABLE ||
  "/home/painsearchdev/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome";

if (browserExec) {
  Config.setBrowserExecutable(browserExec);
}
