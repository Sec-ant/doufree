import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";
import { name, version, author, description, homepage } from "./package.json";
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
        icon: "https://www.douban.com/favicon.ico",
        match: ["https://www.douban.com/*", "https://cdn.jsdelivr.net/*"],
        webRequest: [
          {
            selector: "*/js/sns/lifestream/status.js",
            action: {
              redirect: `https://cdn.jsdelivr.net/gh/Sec-ant/doufree/dist/assets/${version}/status.min.js`,
            },
          },
        ],
        grant: "none",
      },
      clientAlias: "VPM",
    }),
  ],
});
