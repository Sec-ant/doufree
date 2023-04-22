import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";
import { version } from "./package.json";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { minify } from "terser";

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: "src/assets/*",
          dest: `assets/${version}`,
          transform: async (content) => {
            return (await minify(content)).code;
          },
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
        match: ["https://www.douban.com/*"],
        webRequest: [
          {
            selector: "*/js/sns/lifestream/status.js",
            action: {
              redirect: "/assets/status.js",
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
