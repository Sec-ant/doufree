import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";

export default defineConfig({
  publicDir: false,
  plugins: [
    monkey({
      entry: "src/index.ts",
      userscript: {
        name: "DouFree",
        namespace: "https://github.com/Sec-ant/",
        icon: "https://www.douban.com/favicon.ico",
        match: ["https://www.douban.com/*", "https://douban.com/*"],
        grant: "none",
        "run-at": "document-start",
      },
      clientAlias: "VPM",
    }),
  ],
});
