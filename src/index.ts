function isValidUrl(str: string) {
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
      const reshareButton =
        realWrapper.previousElementSibling?.querySelector(
          'a.btn[data-action-type="reshare"]'
        ) ?? null;

      if (reshareButton === null) {
        return;
      }

      reshareButton.insertAdjacentHTML(
        "afterend",
        ` \u00a0\u00a0<a class="btn" data-action-type="localReshare">本级转发</a>`
      );
    }
  );
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
                  {
                    const newXMLResponseText = xhr.responseText.replace(
                      /"url":"([^"]+?)","expanded_url":"([^"]+?)"/g,
                      '"url":"$2","expanded_url":"$2"'
                    );
                    return newXMLResponseText;
                  }
                  break;
                case /https:\/\/www\.douban\.com\/j\/(group\/check_content_clean|check_clean_content)/.test(
                  responseURL
                ):
                  {
                    const newXMLResponseText = '{"r":0}';
                    return newXMLResponseText;
                  }
                  break;
                default: {
                  return xhr.responseText;
                }
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
    ...(document.querySelectorAll(
      'a[href^="https://douc.cc/"]'
    ) as Iterable<HTMLAnchorElement>),
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
