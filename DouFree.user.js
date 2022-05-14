// ==UserScript==
// @name         DouFree
// @namespace    https://www.douban.com/
// @version      0.2
// @description  remove some douban restrictions
// @author       Secant
// @match        https://www.douban.com/*
// @icon         https://www.douban.com/favicon.ico
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
  "use strict";

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

  const mutationObserver = new MutationObserver((_, observer) => {
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

          reshareButton.after("\n\n\n\n        ", localReshareButton);
        }
      );
      observer.disconnect();
    }
  });

  mutationObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
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
            break;
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
  window.onload = () => {
    mutationObserver.disconnect();
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
  };
  // #endregion
})();
