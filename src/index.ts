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

function foundInlineScripts() {
  let found = false;
  const scriptElements: Iterable<HTMLScriptElement> =
    document.querySelectorAll("script");
  for (const scriptElement of scriptElements) {
    const { innerHTML: scriptContent } = scriptElement;
    const matchResult = /https.+?\/js\/sns\/lifestream\/status\.js/.exec(
      scriptContent
    );
    if (matchResult === null) {
      continue;
    }
    found = true;
    break;
  }
  return found;
}

function foundExternalScript() {
  const scriptElement = document.querySelector(
    'script[src$="/js/sns/lifestream/status.js"]'
  );
  if (scriptElement === null) {
    return false;
  }
  return true;
}

function handleMutationObserved(
  _: MutationRecord[],
  observer: MutationObserver
): void {
  // replace scripts
  const foundExternal = foundExternalScript();
  const foundInline = foundInlineScripts();
  let statusScriptIsFound = foundExternal || foundInline;

  // exit and retry in next mutation
  if (!statusScriptIsFound) {
    return;
  }

  // add reshare button
  addLocalShareButton();

  // exit and don't retry again
  observer.disconnect();
}

function registerScriptObserver() {
  const scriptObserver = new MutationObserver(handleMutationObserved);
  scriptObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  document.addEventListener("DOMContentLoaded", () => {
    scriptObserver.disconnect();
  });
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
  expandShortUrl();
}

registerScriptObserver();
patchXMLHttpRequest();
document.addEventListener("DOMContentLoaded", handleDOMContentLoaded);
