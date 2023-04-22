# DouFree.js

DouFree 是一个运行在桌面浏览器上的[用户脚本（Userscript）](https://zh.wikipedia.org/zh-cn/Userscript)，它作用于[豆瓣网页端](https://www.douban.com/)，用于解除部分豆瓣限制。

## 安装

1.  请使用可以安装扩展的现代浏览器（推荐 [Microsoft Edge](https://www.microsoft.com/zh-cn/edge)、[Google Chrome](https://www.google.com/intl/zh-CN/chrome/) 和 [Mozilla Firefox](https://www.mozilla.org/zh-CN/firefox/new/)），安装并启用 [Tampermonkey](https://www.tampermonkey.net/) 扩展；
2.  打开 [DouFree 脚本的 Greasy Fork 页面](https://greasyfork.org/zh-CN/scripts/444959-doufree)安装即可。

## 功能

### 1. 恢复豆瓣广播多级转发功能

豆瓣后端并未限制多级转发，仅在前端做了移除，本脚本可以恢复前端多级转发功能。实现方式是：豆瓣默认的转发按钮功能不变，在它旁边新增一个“本级转发”按钮。该按钮目前可以出现在首页时间线和用户的广播页面。

![](https://img2.doubanio.com/view/note/l/public/p89127461.jpg)

### 2. 移除豆瓣短链接跳转

在豆瓣的广播页面，广播和回复中的网址会被自动转换为豆瓣短链接——以 [https://douc.cc/](https://douc.cc/) 开头，由此豆瓣可以统计某一链接的访问数据，或限制用户对某些链接的访问。本脚本移除了豆瓣短链接跳转，广播和回复中的短链接均被替换为原始链接。

![](https://img2.doubanio.com/view/note/l/public/p89127561.jpg)

短链接移除前

![](https://img1.doubanio.com/view/note/l/public/p89127580.jpg)

短链接移除后

### 3. 阻止访问小组讨论页面时自动跳转豆瓣首页

在浏览器地址栏直接输入/粘贴或以其它方式从豆瓣网站外部访问某些豆瓣小组的讨论链接，在页面加载完毕后，会自动跳回豆瓣首页。

举个例子，在不安装本脚本的情况下，如果你直接将下面这个链接复制到浏览器地址栏访问，页面会自动跳转回豆瓣首页：

[https://www.douban.com/group/topic/263897559/](https://www.douban.com/group/topic/263897559/)

本脚本阻止了自动跳转这一行为。

更新：

这个页面目前似乎已经不会自动跳转了，目前还没找到其它会自动跳转的页面，所以这个例子暂时可以忽略（有其它可以复现的链接可以在评论中给出来）。不过可以肯定的是豆瓣后端会维护一个表来标记某些页面链接是否是「干净」的，前端则通过一个叫做 check_content_clean 或 check_clean_content 的 API 请求来获取这部分信息，并根据得到的结果来判断是否执行跳转操作。也许豆瓣目前已经移除了这部分检测，不过至少从[这里](https://github.com/shion7wong/spy/blob/5b4750cfeb0632656ade06e3164d11141f4a62f8/%0A%E8%84%91%E6%8E%A7%E5%8E%9F%E7%90%86%E7%AE%80%E8%AF%B4-%E5%8F%8D%E8%84%91%E6%8E%A7%20-%20Douban.html#L349)可以看到这是曾经出现过的机制。这个脚本会直接重写这个 API 请求的结果。

### 4. 敏感词检测（暂时移除该功能）

由于词库陈旧外加一些代码 bug，暂时移除该功能。

~~发布和回复豆瓣广播时，本脚本可以在用户输入文字的同时实时检测可能会触发锁定的敏感词。敏感词判别方法是根据一个已有的项目经过代码适配实现的，并且可通过 hash 签名与该项目的词库保持同步。~~

![](https://img1.doubanio.com/view/note/l/public/p89140318.jpg)

检测到的敏感词会显示在输入框的左侧

### 5. 更多功能和需求等待提议和开发……
