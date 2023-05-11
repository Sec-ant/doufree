# DouFree

DouFree 是一个运行在桌面浏览器上的[用户脚本（Userscript）](https://zh.wikipedia.org/zh-cn/Userscript)，它作用于[豆瓣网页端](https://www.douban.com/)，用于解除部分豆瓣限制。

## 安装

1. 请使用可以安装扩展的现代浏览器（推荐 [Microsoft Edge](https://www.microsoft.com/zh-cn/edge)、[Google Chrome](https://www.google.com/intl/zh-CN/chrome/) 和 [Mozilla Firefox](https://www.mozilla.org/zh-CN/firefox/new/)），安装并启用 [Tampermonkey](https://www.tampermonkey.net/) 扩展；

2. 打开 [DouFree 脚本的 Greasy Fork 页面](https://greasyfork.org/zh-CN/scripts/444959-doufree)安装即可。

3. 如果脚本被 Greasy Fork 撤下，你也可以始终在 [GitHub 仓库](https://github.com/Sec-ant/doufree/blob/main/dist/doufree.user.js)中找到最新的脚本，或使用 jsDelivr 所提供的 CDN 服务安装该脚本：https://cdn.jsdelivr.net/gh/Sec-ant/doufree/dist/doufree.user.js

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
