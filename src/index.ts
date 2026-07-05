const LOCAL_RESHARE_SELECTOR = '[data-doufree-action="local-reshare"]';

function isValidUrl(str: string) {
  let url: URL;
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
          value: XMLHttpRequest[T],
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
                  responseURL,
                ):
                  return xhr.responseText.replace(
                    /"url":"([^"]+?)","expanded_url":"([^"]+?)"/g,
                    '"url":"$2","expanded_url":"$2"',
                  );
                case /https:\/\/www\.douban\.com\/j\/(group\/check_content_clean|check_clean_content)/.test(
                  responseURL,
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
  for (const a of [
    ...document.querySelectorAll<HTMLAnchorElement>(
      'a[href^="https://douc.cc/"]',
    ),
  ]) {
    const { href, title, textContent } = a;
    if (title && isValidUrl(title)) {
      a.href = title;
      if (textContent === href) {
        a.textContent = title;
      }
    }
  }
}

function replaceDouListUrls() {
  for (const div of [
    ...document.querySelectorAll<HTMLDivElement>(
      'div[data-target-type="doulist"]',
    ),
  ]) {
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
      'div.title > a, p.text > a[href^="https://www.douban.com/doulist"]',
    );
    if (!linkElement) {
      return;
    }
    linkElement.href = url;
    linkElement.target = "_black";
  }
}

function isNativeReshareButton(element: Element): element is HTMLAnchorElement {
  if (!element || element.tagName !== "A") {
    return false;
  }
  if (element.matches(LOCAL_RESHARE_SELECTOR)) {
    return false;
  }
  const action =
    element.getAttribute("data-action-type") || element.getAttribute("action");
  return (
    action === "reshare" ||
    element.classList.contains("btn-reshare") ||
    element.classList.contains("btn-key-reshare")
  );
}

function getStatusNode(button: Element) {
  return button.closest(".status-wrapper, .new-status, .status-item");
}

function getPrimaryStatusItem(statusNode: Element | null) {
  if (!statusNode) {
    return null;
  }
  if (statusNode.matches(".status-item")) {
    return statusNode;
  }
  for (const child of [...statusNode.children]) {
    if (child.matches(".status-item")) {
      return child;
    }
  }
  return statusNode.querySelector(".status-item");
}

function getLocalReshareContent(button: Element) {
  const statusItem = getPrimaryStatusItem(getStatusNode(button));
  if (!statusItem) {
    return "";
  }
  const clone = statusItem.cloneNode(true) as Element;
  for (const selector of [
    ".others",
    ".actions",
    ".quote-expand",
    ".comments",
    ".comments-items",
    LOCAL_RESHARE_SELECTOR,
  ]) {
    for (const node of [...clone.querySelectorAll(selector)]) {
      node.remove();
    }
  }
  return `<div class='status-real-wrapper'>${clone.innerHTML}</div>`;
}

function patchNativeModalLocalReshare() {
  let pendingContent = "";

  const patchOpenModal = () => {
    if (!pendingContent) {
      return false;
    }
    const content = document.querySelector<HTMLElement>(
      ".dui-modal-container.visible .reshare-modal .reshare-content, .reshare-modal .reshare-content",
    );
    if (!content) {
      return false;
    }
    content.innerHTML = pendingContent;
    pendingContent = "";
    document.documentElement?.setAttribute(
      "data-doufree-local-modal",
      "patched",
    );
    return true;
  };

  const queueModalPatch = () => {
    for (const delay of [0, 30, 100, 300, 700]) {
      window.setTimeout(patchOpenModal, delay);
    }
  };

  const bindLocalButton = (
    localReshareButton: HTMLAnchorElement,
    nativeReshareButton: HTMLAnchorElement,
  ) => {
    localReshareButton.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        pendingContent = getLocalReshareContent(nativeReshareButton);
        nativeReshareButton.click();
        queueModalPatch();
      },
      true,
    );
  };

  const ensureButtons = () => {
    const buttons = [
      ...document.querySelectorAll(
        'a[data-action-type="reshare"], a[action="reshare"], a.btn-reshare, a.btn-key-reshare',
      ),
    ].filter(isNativeReshareButton);
    for (const nativeReshareButton of buttons) {
      if (
        nativeReshareButton.parentElement?.querySelector(LOCAL_RESHARE_SELECTOR)
      ) {
        continue;
      }
      const localReshareButton = document.createElement("a");
      localReshareButton.className = nativeReshareButton.className || "btn";
      localReshareButton.href = "javascript:void(0)";
      localReshareButton.textContent = "\u672c\u7ea7\u8f6c\u53d1";
      localReshareButton.setAttribute("data-action-type", "localReshare");
      localReshareButton.setAttribute("data-doufree-action", "local-reshare");
      bindLocalButton(localReshareButton, nativeReshareButton);
      nativeReshareButton.after(
        document.createTextNode(" "),
        localReshareButton,
      );
      document.documentElement?.setAttribute(
        "data-doufree-local-button",
        "native-modal",
      );
    }
  };

  const scheduleEnsure = () => {
    window.requestAnimationFrame(ensureButtons);
  };

  scheduleEnsure();
  window.setInterval(ensureButtons, 1000);
  new MutationObserver(() => {
    scheduleEnsure();
    patchOpenModal();
  }).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

function runPatch(name: string, patch: () => void) {
  try {
    patch();
  } catch (error) {
    console.error(`[DouFree] ${name} failed`, error);
  }
}

function markLocalReshareActive() {
  const mark = () => {
    document.documentElement?.setAttribute(
      "data-doufree-local-reshare",
      "active",
    );
  };
  mark();
  document.addEventListener("DOMContentLoaded", mark, { once: true });
  window.addEventListener("load", mark, { once: true });
}

function removeUnderscoreISearchParam() {
  const replaceStateOriginal = window.history.replaceState;
  window.history.replaceState = (_, __, url) => {
    if (url) {
      const urlObj = new URL(url);
      const urlSearchParams = urlObj.searchParams;
      urlSearchParams.delete("_i");
      urlObj.hash = urlObj.hash.replace(/(&|\?)_i=.*$/, "");
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

if (["douban.com", "www.douban.com"].includes(window.location.host)) {
  markLocalReshareActive();
  runPatch("native modal local reshare", patchNativeModalLocalReshare);
  runPatch("history patch", removeUnderscoreISearchParam);
  runPatch("XMLHttpRequest patch", patchXMLHttpRequest);
  window.addEventListener("load", handleWindowLoaded);
}
