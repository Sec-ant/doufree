import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";
import { version } from "./package.json";

const { selector, redirect } = getWebRequest();

export default defineConfig({
  publicDir: false,
  plugins: [
    monkey({
      entry: "src/index.ts",
      userscript: {
        name: "DouFree",
        namespace: "https://github.com/Sec-ant/",
        icon: "https://www.douban.com/favicon.ico",
        match: ["https://www.douban.com/*", "https://fastly.jsdelivr.net/*"],
        webRequest: [
          {
            selector,
            action: {
              redirect,
            },
          },
        ],
        grant: "none",
        "run-at": "document-start",
      },
      clientAlias: "VPM",
    }),
  ],
});

function getWebRequest() {
  let scriptUrl: string;
  try {
    scriptUrl =
      process.env.SCRIPT_URL ??
      JSON.parse(
        readFileSync("./script-url.meta.json", { encoding: "utf8" }),
      )[0];
    if (!scriptUrl) {
      throw undefined;
    }
  } catch {
    throw new Error("Script url is not found.");
  }
  const scriptUrlObject = new URL(scriptUrl);
  const scriptPathName = scriptUrlObject.pathname;
  const selector = `*${scriptPathName.replace(
    /index\..+?\.js$/,
    "index.*.js",
  )}`;
  const redirect = `https://fastly.jsdelivr.net/npm/doufree@${version}/dist/assets/${basename(
    scriptPathName,
    ".js",
  )}.patch.js`;
  return {
    selector,
    redirect,
  };
}
