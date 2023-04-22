// ==UserScript==
// @name         DouFree
// @namespace    https://github.com/Sec-ant/
// @version      0.8.1
// @author       豆泥@豆瓣
// @description  Free you from DouBan restrictions
// @icon         https://www.douban.com/favicon.ico
// @homepage     https://github.com/Sec-ant/DouFree.js
// @match        https://www.douban.com/*
// @match        https://cdn.jsdelivr.net/*
// @webRequest   {"selector":"*/js/sns/lifestream/status.js","action":{"redirect":"https://cdn.jsdelivr.net/gh/Sec-ant/DouFree.js@dev/dist/assets/0.8.1/status.min.js"}}
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  function isValidUrl(str) {
    let url;
    try {
      url = new URL(str);
    } catch {
      return false;
    }
    return ["http:", "https:", "file:", "ftp:"].includes(url.protocol);
  }
  function addLocalShareButton() {
    [...document.querySelectorAll("div.status-real-wrapper")].forEach(
      (realWrapper) => {
        var _a;
        const reshareButton = ((_a = realWrapper.previousElementSibling) == null ? void 0 : _a.querySelector(
          'a.btn[data-action-type="reshare"]'
        )) ?? null;
        if (reshareButton === null) {
          return;
        }
        reshareButton.insertAdjacentHTML(
          "afterend",
          `   <a class="btn" data-action-type="localReshare">本级转发</a>`
        );
      }
    );
  }
  function patchXMLHttpRequest() {
    const OLD_XHR = window.XMLHttpRequest;
    window.XMLHttpRequest = class extends XMLHttpRequest {
      constructor() {
        super();
        return new Proxy(new OLD_XHR(), {
          set(xhr, key, value) {
            if (key in xhr) {
              xhr[key] = value;
            }
            return true;
          },
          get(xhr, key) {
            switch (key) {
              case "responseText": {
                const { responseURL } = xhr;
                switch (true) {
                  case /https:\/\/www\.douban\.com\/j\/status\/comments\?sid=\d+&resp_type=c_dict/.test(
                    responseURL
                  ): {
                    const newXMLResponseText = xhr.responseText.replace(
                      /"url":"([^"]+?)","expanded_url":"([^"]+?)"/g,
                      '"url":"$2","expanded_url":"$2"'
                    );
                    return newXMLResponseText;
                  }
                  case /https:\/\/www\.douban\.com\/j\/(group\/check_content_clean|check_clean_content)/.test(
                    responseURL
                  ): {
                    const newXMLResponseText = '{"r":0}';
                    return newXMLResponseText;
                  }
                  default: {
                    return xhr.responseText;
                  }
                }
              }
              default: {
                const value = xhr[key];
                if (typeof value === "function") {
                  return (...args) => value.apply(xhr, args);
                }
                return value;
              }
            }
          }
        });
      }
    };
  }
  function expandShortUrl() {
    [
      ...document.querySelectorAll(
        'a[href^="https://douc.cc/"]'
      )
    ].forEach((a) => {
      const { href, title, textContent } = a;
      if (title && isValidUrl(title)) {
        a.href = title;
        if (textContent === href) {
          a.textContent = title;
        }
      }
    });
  }
  function handleDOMContentLoaded() {
    addLocalShareButton();
    expandShortUrl();
  }
  patchXMLHttpRequest();
  document.addEventListener("DOMContentLoaded", handleDOMContentLoaded);

})();
