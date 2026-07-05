# DouFree

DouFree 是一个运行在桌面浏览器上的[用户脚本（Userscript）](https://zh.wikipedia.org/zh-cn/Userscript)，它作用于[豆瓣网页端](https://www.douban.com/)，用于解除部分豆瓣限制。

## 安装

1. 请使用可以安装扩展的现代浏览器（推荐 [Microsoft Edge](https://www.microsoft.com/zh-cn/edge)、[Google Chrome](https://www.google.com/intl/zh-CN/chrome/) 和 [Mozilla Firefox](https://www.mozilla.org/zh-CN/firefox/new/)），安装并启用 [Tampermonkey](https://www.tampermonkey.net/) 扩展；

2. 打开 [DouFree 脚本的 Greasy Fork 页面](https://greasyfork.org/zh-CN/scripts/444959-doufree)安装即可；

3. 如果脚本被 Greasy Fork 撤下，你也可以在 jsDelivr CDN 上找到该脚本：https://fastly.jsdelivr.net/npm/doufree/dist/doufree.user.js

## 从源码构建

如果你是从本仓库源码构建本地版本，需要先安装 [Node.js](https://nodejs.org/)（会自带 `npm`），然后在项目根目录运行：

```bash
npm install
npm run build
```

构建产物会生成在 `dist/doufree.user.js`。打开 Tampermonkey 的管理面板，新增或编辑 DouFree 脚本，把该文件内容安装进去即可。

Chrome 138+ 和 Tampermonkey 5.3+ 用户需要在 Chrome 扩展详情页开启「允许运行用户脚本」。如果修改了 userscript 元信息（例如 `@match`、`@grant`、`@run-at`）后页面上没有生效，请重新加载 Tampermonkey 扩展并刷新豆瓣页面。

## 1.4.2 新版改动

由于 Tampermonkey 5.3.0+ 在新版 Chrome 上不再支持原来的 `webRequest` 用户脚本能力，同时新版 Chrome 对扩展拦截网络请求的能力也做了限制，DouFree 不再通过拦截和替换豆瓣前端脚本来恢复本级转发功能。

当前实现改为 DOM 层方案：脚本会在豆瓣原生「转发」按钮旁边新增「本级转发」按钮；点击「本级转发」时，先复用豆瓣原生「转发」按钮打开弹窗，再把弹窗中的引用内容替换成本级广播内容。这样可以继续使用豆瓣自己的弹窗、接口参数和提交逻辑。

优势：

- 不再依赖 Tampermonkey 的 `webRequest`，兼容新版 Chrome 和 Tampermonkey。
- 不需要下载、改写或内嵌豆瓣前端脚本，构建流程更简单。
- 复用豆瓣原生转发逻辑，不需要脚本自行拼接转发 API 参数。
- userscript 权限更少，目前使用 `@grant none`。

劣势：

- 依赖豆瓣页面上的 DOM 结构和转发弹窗结构；如果豆瓣改版，可能需要调整选择器。
- 本级转发按钮需要等页面中的原生「转发」按钮渲染出来后再插入，动态加载内容可能会有短暂延迟。
- 该方案只处理网页端已渲染出的广播内容，不等同于恢复豆瓣官方完整客户端能力。

潜在风险：

- 脚本会克隆当前页面中已经渲染的广播 DOM，并放入转发弹窗。如果豆瓣页面本身出现未过滤的恶意 HTML，克隆内容也可能一并带入弹窗。
- 脚本会触发同一条广播旁边的原生「转发」按钮，但不会自动提交转发；最终提交仍由用户在豆瓣原生弹窗中确认。
- 如果浏览器或 Tampermonkey 没有加载最新的 userscript 元信息（例如 `@match`、`@grant`），可能出现脚本在某些页面不运行的情况。此时需要重新加载 Tampermonkey 扩展并刷新豆瓣页面。

## 功能

### 恢复豆瓣广播多级转发功能

豆瓣后端并未限制多级转发，仅在前端做了移除，本脚本可以恢复前端多级转发功能。这个脚本会在豆瓣默认的转发按钮旁边新增一个「本级转发」按钮。该按钮目前可以出现在首页时间线和用户的广播页面。

![](https://img2.doubanio.com/view/note/l/public/p89127461.jpg)

### 移除豆瓣短链接跳转

在豆瓣的广播页面，广播和回复中的网址会被自动转换为豆瓣短链接——以 [https://douc.cc/](https://douc.cc/) 开头，由此豆瓣可以统计某一链接的访问数据，或限制用户对某些链接的访问。这个脚本移除了豆瓣短链接跳转，广播和回复中的短链接均被替换为原始链接。

![](https://img2.doubanio.com/view/note/l/public/p89127561.jpg)

短链接移除前

![](https://img1.doubanio.com/view/note/l/public/p89127580.jpg)

短链接移除后

### 阻止访问小组讨论页面时自动跳转豆瓣首页

在浏览器地址栏直接输入/粘贴或以其它方式从豆瓣网站外部访问某些豆瓣小组的讨论链接，在页面加载完毕后，会自动跳回豆瓣首页。本脚本阻止了自动跳转这一行为。

更新：

由于这个问题目前似乎已经被豆瓣修复，如果再次发现此问题可汇报 issue。

关于该问题的相关记录：

- https://www.douban.com/note/830739518/
- https://www.douban.com/group/topic/256167836/
- https://v2ex.com/t/825797
- https://guozh.net/douban-redirect-to-home/

### 敏感词检测（暂时移除该功能）

~~由于词库陈旧外加一些代码 bug，暂时移除该功能。~~

### 豆列收藏链接直达

豆瓣网页端点击广播时间线上的收藏链接会跳转到该收藏链接所在的豆列，而非链接所指向的内容本身。本脚本可以让用户点击收藏链接后直接访问该内容。

### 去除 `_i` URL 尾缀

豆瓣会在某些页面打开后（如小组帖子、日记等页面），在网址后方自动添加一个形如 `_i=3827211uOm9fTX` 的尾缀（这个字符串由时间戳 + 浏览器 id 组成）。本脚本可阻止豆瓣这一行为。

### 更多功能和需求等待提议和开发……
