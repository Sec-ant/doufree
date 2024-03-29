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
        icon: "https://www.douban.com/favicon.ico",
        match: ["https://www.douban.com/*", "https://cdn.jsdelivr.net/*"],
        webRequest: [
          {
            selector: "*/dist/sns/status/index.js",
            action: {
              redirect: `https://cdn.jsdelivr.net/gh/Sec-ant/doufree/dist/assets/${version}/index.min.js`,
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
