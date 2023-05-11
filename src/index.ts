function isValidUrl(str: string) {
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
      return new Proxy<XMLHttpRequest>(new OLD_XHR(), {
        set<T extends keyof XMLHttpRequest>(
          xhr: XMLHttpRequest,
          key: T,
          value: XMLHttpRequest[T]
        ) {
          if (key in xhr) {
            xhr[key] = value;
          }
          return true;
        },
        get<T extends keyof XMLHttpRequest>(xhr: XMLHttpRequest, key: T) {
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
                return (...args: unknown[]) => value.apply(xhr, args);
              }
              return value;
            }
          }
        },
      });
    }
  };
}

function expandShortUrl() {
  [
    ...document.querySelectorAll<HTMLAnchorElement>(
      'a[href^="https://douc.cc/"]'
    ),
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
    ...document.querySelectorAll<HTMLDivElement>(
      'div[data-target-type="doulist"]'
    ),
  ].forEach((div) => {
    const dataObjectId = div.getAttribute("data-object-id");
    if (dataObjectId === null) {
      return;
    }
    let url: string;
    switch (div.getAttribute("data-object-kind")) {
      case "1011":
        url = `https://www.douban.com/event/${dataObjectId}/`;
        break;
      case "1012":
        url = `https://www.douban.com/review/${dataObjectId}/`;
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
    const linkElement = div.querySelector<HTMLAnchorElement>(
      'div.title > a, p.text > a[href^="https://www.douban.com/doulist"]'
    );
    if (!linkElement) {
      return;
    }
    linkElement.href = url;
    linkElement.target = "_black";
  });
}

function removeUnderscoreISearchParam() {
  const replaceStateOriginal = window.history.replaceState;
  window.history.replaceState = function (_, __, url) {
    if (url) {
      const urlObj = new URL(url);
      const urlSearchParams = urlObj.searchParams;
      urlSearchParams.delete("_i");
      urlObj.hash = urlObj.hash.replace(/&_i=.*$/, "");
      url = urlObj.toString();
    }
    return replaceStateOriginal.call(window.history, _, __, url);
  };
}

function handleWindowLoaded() {
  expandShortUrl();
  replaceDouListUrls();
  window.removeEventListener("load", handleWindowLoaded);
}

if (window.location.host === "www.douban.com") {
  removeUnderscoreISearchParam();
  patchXMLHttpRequest();
  window.addEventListener("load", handleWindowLoaded);
}
