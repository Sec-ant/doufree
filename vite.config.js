import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";
import { version } from "./package.json";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  publicDir: false,
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: "public/*",
          dest: `assets/${version}`,
        },
      ],
    }),
    monkey({
      entry: "src/index.ts",
      userscript: {
        name: "DouFree",
        namespace: "https://github.com/Sec-ant/",
        version,
        author: "豆泥@豆瓣",
        description: "Free you from DouBan restrictions",
        homepage: "https://github.com/Sec-ant/DouFree.js",
        icon: "https://www.douban.com/favicon.ico",
        match: ["https://www.douban.com/*", "https://cdn.jsdelivr.net/*"],
        webRequest: [
          {
            selector: "*/js/sns/lifestream/status.js",
            action: {
              redirect: `https://cdn.jsdelivr.net/gh/Sec-ant/DouFree.js@dev/dist/assets/${version}/status.min.js`,
            },
          },
          {
            selector: "*/js/sns/doulist/doulist_dialog.js",
            action: {
              redirect: `https://cdn.jsdelivr.net/gh/Sec-ant/DouFree.js@dev/dist/assets/${version}/doulist_dialog.min.js`,
            },
          },
        ],
        "run-at": "document-start",
        grant: "none",
      },
      clientAlias: "VPM",
    }),
  ],
});
