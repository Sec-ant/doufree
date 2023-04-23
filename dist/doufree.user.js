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
// @webRequest   {"selector":"*/js/sns/doulist/doulist_dialog.js","action":{"redirect":"https://cdn.jsdelivr.net/gh/Sec-ant/DouFree.js@dev/dist/assets/0.8.1/doulist_dialog.min.js"}}
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
                  ):
                    return xhr.responseText.replace(
                      /"url":"([^"]+?)","expanded_url":"([^"]+?)"/g,
                      '"url":"$2","expanded_url":"$2"'
                    );
                  case /https:\/\/www\.douban\.com\/j\/(group\/check_content_clean|check_clean_content)/.test(
                    responseURL
                  ):
                    return '{"r":0}';
                  default:
                    return xhr.responseText;
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
  function replaceDouListUrls() {
    [
      ...document.querySelectorAll(
        'div[data-target-type="doulist"]'
      )
    ].forEach((div) => {
      const dataObjectId = div.getAttribute("data-object-id");
      if (dataObjectId === null) {
        return;
      }
      let url;
      switch (div.getAttribute("data-object-kind")) {
        case "1011":
          url = `https://www.douban.com/event/${dataObjectId}/`;
          break;
        case "1012":
          url = `https://movie.douban.com/review/${dataObjectId}/`;
          break;
        case "1013":
          url = `https://www.douban.com/group/topic/${dataObjectId}/`;
          break;
        case "1015":
          url = `https://www.douban.com/note/${dataObjectId}/`;
          break;
        case "3055":
          url = `https://www.douban.com/people/x/status/${dataObjectId}/`;
          break;
        default:
          return;
      }
      const linkElement = div.querySelector("div.title > a");
      if (!linkElement) {
        return;
      }
      linkElement.href = url;
      linkElement.target = "_black";
    });
  }
  function addDouListScript() {
    const scriptElement = document.createElement("script");
    scriptElement.src = "/js/sns/doulist/doulist_dialog.js";
    document.body.append(scriptElement);
  }
  function handleDOMContentLoaded() {
    expandShortUrl();
    replaceDouListUrls();
    addDouListScript();
  }
  patchXMLHttpRequest();
  document.addEventListener("DOMContentLoaded", handleDOMContentLoaded);

})();
