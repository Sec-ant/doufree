// ==UserScript==
// @name         DouFree
// @namespace    https://www.douban.com/
// @version      0.5
// @description  remove some douban restrictions
// @author       Secant
// @match        https://www.douban.com/*
// @require      https://cdn.jsdelivr.net/gh/drrouen/NouBan-js@4e384c593d55ae6c2b002500117fa6f4f33409ed/censoredWords.js
// @require      https://cdn.jsdelivr.net/npm/opencc-js@1.0.3/data.min.js
// @require      https://cdn.jsdelivr.net/npm/opencc-js@1.0.3/data.t2cn.min.js
// @require      https://cdn.jsdelivr.net/npm/opencc-js@1.0.3/bundle-browser.min.js
// @require      https://cdn.jsdelivr.net/gh/Sec-ant/NouBan.js@b9ecd066900762c2e98c4c4d61910087d9b5887a/dist/nouban.js
// @require      https://unpkg.com/@popperjs/core@2
// @require      https://unpkg.com/@stitches/core/dist/index.global.js
// @icon         https://www.douban.com/favicon.ico
// @grant        none
// @run-at       document-start
// ==/UserScript==
/* global NouBan, Popper, stitches */
(function () {
  "use strict";
  const { css } = stitches;
  // #region FUNCTIONS
  function isValidUrl(string) {
    let url;
    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }
    return ["http:", "https:", "file:", "ftp:"].includes(url.protocol);
  }
  // #endregion

  // #region SCRIPT-INTERCEPTION
  const statusScriptSource =
    "https://bafybeifiw2g6rlccgbji2aikdn5ka2ow53emczwftno46eoruijw4nxxpu.ipfs.nftstorage.link/status.js";

  const scriptObserver = new MutationObserver((_, observer) => {
    let found = false;

    // statuses page
    const scripts = document.querySelectorAll("script");
    for (const script of scripts) {
      const scriptContent = script.innerHTML;
      const result = /https[^']+?\/js\/sns\/lifestream\/status\.js/.exec(
        scriptContent
      );
      if (result) {
        const { 0: match, index } = result;
        script.innerHTML =
          scriptContent.slice(0, index) +
          statusScriptSource +
          scriptContent.slice(index + match.length);
        found = true;
        break;
      }
    }

    // main page
    if (!found) {
      const statusScript = document.querySelector(
        'script[src$="/js/sns/lifestream/status.js"]'
      );
      if (statusScript) {
        statusScript.setAttribute("src", statusScriptSource);
        found = true;
      }
    }

    // add buttons
    if (found) {
      [...document.querySelectorAll("div.status-real-wrapper")].forEach(
        (realWrapper) => {
          const reshareButton =
            realWrapper.previousElementSibling.querySelector(
              'a.btn[data-action-type="reshare"]'
            );

          const localReshareButton = document.createElement("a");
          localReshareButton.innerHTML = "本级转发";
          localReshareButton.classList.add("btn");
          localReshareButton.setAttribute("data-action-type", "localReshare");

          reshareButton.after(" \u00a0\u00a0", localReshareButton);
        }
      );
      observer.disconnect();
    }
  });

  scriptObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  // #endregion

  // #region INPUT-DETECTION
  const inputSelectors = [
    "textarea#isay-cont", // 广播
    "input.lite-comment-reply-input", // 广播回复
  ];
  const toolTipStyledClass = css({
    backgroundColor: "FireBrick",
    color: "White",
    padding: "5px 10px",
    borderRadius: "4px",
    fontSize: "13px",
    display: "none",
    overflowWrap: "break-word",
    maxWidth: "160px",
    "&.display": {
      display: "block",
    },
  });
  const wm = new WeakMap();
  const inputObserver = new MutationObserver(() => {
    const inputElems = [
      ...(document.querySelectorAll(inputSelectors.join(",")) || []),
    ];
    for (const inputElem of inputElems) {
      if (wm.has(inputElem)) {
        continue;
      }
      const toolTipElem = document.createElement("div");
      toolTipElem.classList.add(toolTipStyledClass());
      document.body.append(toolTipElem);
      Popper.createPopper(inputElem, toolTipElem, {
        placement: "left-start",
        modifiers: [
          {
            name: "offset",
            options: {
              offset: [0, 8],
            },
          },
        ],
      });
      wm.set(inputElem, undefined);
      inputElem.addEventListener("input", () => {
        const timeout = wm.get(inputElem);
        clearTimeout(timeout);
        const newTimeout = setTimeout(() => {
          const { result, list } = NouBan.censorCheck(inputElem.value);
          if (result) {
            toolTipElem.classList.add("display");
            toolTipElem.innerHTML = [...list].join(" ");
          } else {
            toolTipElem.classList.remove("display");
          }
        }, 200);
        wm.set(inputElem, newTimeout);
      });
    }
  });
  inputObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  // #endregion

  // #region FIRE-FOX-BEFORE-SCRIPT-EXECUTE
  let mutated = false;
  document.addEventListener("beforescriptexecute", (e) => {
    const { src } = e.target;
    if (/status\.js$/.test(src) && !mutated) {
      e.preventDefault();
      const scriptElement = document.createElement("script");
      scriptElement.setAttribute("src", src);
      mutated = true;
      e.target.replaceWith(scriptElement);
    }
  });
  // #endregion

  // #region PROXIES
  const OriginalXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = function () {
    return new Proxy(new OriginalXHR(), {
      set(xhr, key, value) {
        if (key in xhr) {
          xhr[key] = value;
        }
        return true;
      },
      get(xhr, key) {
        switch (key) {
          case "responseText":
            if (
              /https:\/\/www\.douban\.com\/j\/status\/comments\?sid=\d+&resp_type=c_dict/.test(
                xhr.responseURL
              )
            ) {
              const newXMLResponseText = xhr.responseText.replace(
                /"url":"([^"]+?)","expanded_url":"([^"]+?)"/g,
                '"url":"$2","expanded_url":"$2"'
              );
              return newXMLResponseText;
            } else if (
              /https:\/\/www\.douban\.com\/j\/group\/check_content_clean/.test(
                xhr.responseURL
              )
            ) {
              const newXMLResponseText = '{"r":0}';
              return newXMLResponseText;
            } else {
              return xhr.responseText;
            }
          default: {
            if (!key in xhr) return undefined;
            let value = xhr[key];
            if (typeof value === "function") {
              value = this[key] || value;
              return (...args) => value.apply(xhr, args);
            } else {
              return value;
            }
          }
        }
      },
    });
  };
  // #endregion

  // #region DOCUMENT-IDLE-SCRIPTS
  document.addEventListener("DOMContentLoaded", () => {
    scriptObserver.disconnect();
    [...document.querySelectorAll('a[href^="https://douc.cc/"]')].forEach(
      (a) => {
        const { href, title, textContent } = a;
        if (title && isValidUrl(title)) {
          a.href = title;
          if (textContent === href) {
            a.textContent = title;
          }
        }
      }
    );
  });
  // #endregion
})();
