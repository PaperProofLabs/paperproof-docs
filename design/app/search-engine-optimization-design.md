Copyright (c) 2026 PaperProof Labs. All rights reserved.
SPDX-License-Identifier: LicenseRef-PaperProof-Docs-Source-Available

# PaperProof 官网搜索引擎优化设计

## 1. 文档目的

本文给出 PaperProof 官网的搜索引擎优化设计，用于指导后续官网在不破坏协议语义、不牺牲当前交互能力的前提下，提升：

- 搜索引擎收录率；
- 搜索结果摘要质量；
- Docs / Blog / Artifact / Papers 等页面的可发现性；
- X、Telegram、微信等分享场景下的链接预览质量；
- 公开知识内容在长期传播中的可见性。

本文是产品与架构设计，不直接修改代码。后续官网优化应以本文为约束。

## 2. 背景与现状

### 2.1 当前官网的现实架构

当前 PaperProof 官网不是传统 SSR 站点，而是：

- `paperproof-app` 提供静态前端壳；
- 前端使用 hash 路由，即 `#/docs/...`、`#/artifact/...`、`#/blog/...`；
- 公开内容正文已经部分接入 `paperproof-indexer-reference` 的 server-assisted content API；
- 但最终页面 DOM 仍主要由浏览器端 JavaScript 渲染；
- 页面主内容、列表、详情、分页、标题切换等，大量依赖前端运行后再装载。

换句话说，当前官网更接近：

```text
static shell + hash routing + browser rendering + partial server-assisted content
```

而不是：

```text
path-based public pages + server-rendered HTML + crawler-ready metadata
```

### 2.2 当前对 SEO 不友好的关键点

结合现有实现，PaperProof 官网当前对搜索引擎收录并不友好，核心原因包括：

1. 使用 hash 路由

- 当前公开页面主要是 `https://paperproof.site/#/...`
- `#` 后面的内容不会作为标准 URL path 参与服务器侧页面路由
- 很多搜索引擎、社交爬虫、站点目录、企业知识采集器对 hash 路由支持弱
- 即使 Google 能一定程度执行 JS，hash 路由仍不利于稳定索引、规范 canonical 和站点地图管理

2. 页面首屏 HTML 几乎不包含具体页面正文

- 服务器返回的通常是统一的 `index.html`
- 实际正文在浏览器执行 JS 后才出现
- Docs、Blog、Artifact 等页面在爬虫只抓取原始 HTML 时，可见内容非常少

3. 页面级 metadata 不足

- 当前站点根 HTML 只有全站级别的基础 `description`
- 没有按页面动态输出：
  - `<title>`
  - `<meta name="description">`
  - canonical
  - Open Graph
  - Twitter Card
  - structured data

4. 缺乏 pathname 级的可索引公开 URL

- 用户和搜索引擎更理想的 URL 应该是：
  - `/docs/getting-started/introduction`
  - `/blog/paperproof-as-artifact-infrastructure-not-just-a-content-app`
  - `/artifact/PaperProof-blog_post-001172-586090a52316`
- 而不是只能通过 `#/...` 进入

5. 缺乏针对公开内容的 sitemap / robots / canonical 体系

- 当前难以稳定生成“公开内容清单”
- 搜索引擎无法被明确告知哪些页面值得抓取、哪些页面不该抓取、哪个 URL 才是规范 URL

6. 部分重要列表页和详情页内容依赖 JS 查询接口

- Explore、type 列表、artifact detail、version history、governance detail 等都依赖客户端装载
- 对爬虫来说，正文与结构化信息不够早出现

7. 前端包体较大，抓取与渲染成本偏高

- 当前前端主包较大
- 对搜索引擎渲染队列、弱网环境、移动端首屏都不友好
- 虽然这不是 SEO 的根因，但会显著影响收录质量和速度

### 2.3 当前架构的优点

虽然 SEO 不强，但当前架构有几个不能丢的优点：

- 与协议层解耦清晰；
- 公共内容已有 indexer 辅助服务能力；
- 用户签名、发布、评论、治理等强交互流程仍可由前端完成；
- 可通过现有官方内容 API 向 SEO 友好架构演进，而不必推倒重来。

因此，PaperProof 不应做“整站重写式 SEO 改造”，而应做：

```text
公开可读页面 SEO 化 + 钱包交互页面继续 SPA 化
```

## 3. 设计目标

### 3.1 业务目标

SEO 优化后的官网应做到：

- Docs、Blog、Papers、Artifact detail 等公开内容可被搜索引擎稳定收录；
- 搜索结果能展示高质量标题与摘要；
- 分享到 X / Telegram / 微信时有正确预览卡片；
- 公开页面在无钱包、无登录、无 JS 或弱 JS 条件下，仍能被机器读取主要内容；
- 不破坏当前电脑端 UI 风格与主要交互体验；
- 不改变协议事实来源：Sui + Walrus 仍是事实根。

### 3.2 技术目标

- 建立 path-based public route 体系；
- 为高价值公开页面提供 server-rendered 或 prerendered HTML；
- 建立 page-level metadata、canonical、sitemap、robots、structured data 体系；
- 保留当前前端 hydration 和钱包交互能力；
- 保证 indexer / official content API 仍是“可重建的缓存层”，不是协议真相源。

### 3.3 非目标

本项目不以以下内容为目标：

- 不把整站所有页面都强制改为传统 SSR；
- 不把发布、投票、评论提交、钱包连接等交互流程搬到服务器执行；
- 不让 server 变成内容 authority；
- 不为了 SEO 改变协议对象模型、artifact model、评论树或治理逻辑；
- 不先做全站视觉重构。

## 4. 总体策略

推荐采用混合式 SEO 架构：

```text
public read pages: path-based + server-rendered/prerendered + hydrated
interactive app flows: SPA/hash-compatible or client-routed
```

更具体地说：

1. 对“公开、稳定、阅读型”的页面做 SEO 化

- Docs
- Official Blog
- Forum topic body
- Artifact detail
- Type list
- Explore landing
- Proposal detail
- Papers / Preprints / Technical Reports detail

2. 对“强交互、个性化、依赖钱包”的页面维持前端主导

- Publish
- Add Version
- Governance create proposal
- My Space
- Settings
- Copilot memory / local delegate flows

3. 引入 path 路由作为公开 canonical URL

- 公开页面必须拥有不带 `#` 的 canonical URL
- 旧 hash URL 保留兼容，但不应继续作为规范收录入口

4. 公开页面采用“服务端首屏内容 + 前端接管交互”

- 搜索引擎、社交爬虫拿到的是完整首屏 HTML 和 metadata
- 用户进入后，前端再 hydration，继续使用现有交互能力

## 5. 路由与 URL 设计

### 5.1 推荐 canonical URL

建议将以下 pathname 作为公开规范 URL：

- 首页 / Explore
  - `/`
  - `/explore`

- Docs
  - `/docs`
  - `/docs/:section`
  - `/docs/:section/:topic`

- Blog
  - `/blog`
  - `/blog/:postId`

- Forum
  - `/forum`
  - `/forum/:topicId`

- Artifact
  - `/artifact/:artifactCode`

- Type lists
  - `/type/:slug`

- Governance
  - `/governance`
  - `/proposal/:proposalId`

### 5.2 Hash URL 的定位

现有 hash URL 不能立即废弃，但应降级为兼容入口：

- `https://paperproof.site/#/docs/...`
- `https://paperproof.site/#/blog/...`
- `https://paperproof.site/#/artifact/...`

设计要求：

- path URL 是 canonical；
- hash URL 继续可访问；
- hash URL 页面应通过前端或服务器注入 canonical，指向对应 path URL；
- 后续分享、站内跳转、官方发布、工件说明、博客引用，都应优先使用 path URL。

### 5.3 路由迁移建议

推荐分两阶段：

阶段 A：双栈兼容

- 保留现有 hash 路由逻辑；
- 增加 pathname 入口；
- 服务端按 pathname 输出 SEO HTML；
- 前端启动后把 pathname 解析为内部 route state；
- 站内新链接逐步切到 pathname。

阶段 B：内部主导航全面 path 化

- 前端内部链接默认使用 pathname；
- hash 仅保留老链接兼容；
- analytics、sitemap、canonical、分享卡片统一以 pathname 为准。

## 6. 页面分级与优先级

### 6.1 P0：必须优先 SEO 化的页面

这些页面最值得被搜索引擎收录：

1. Docs pages

- 解释协议是什么
- 面向新用户和开发者
- 更新频率可控
- 文本信息密度高

2. Official Blog posts

- 适合关键词覆盖
- 适合分享传播
- 有较强 narrative 价值

3. Artifact detail pages for:

- preprints
- technical reports
- blog posts
- datasets
- software releases

原因：

- 这是协议最核心的公开对象页
- 每个 artifact 天然是一个可引用内容单元

4. Type list pages

- `/type/preprints`
- `/type/blog-posts`
- `/type/technical-reports`
- `/type/datasets`
- `/type/software-releases`
- `/type/generic-files`

这些页适合作为集合页被收录。

### 6.2 P1：应尽快补齐的页面

- `/explore`
- `/blog`
- `/docs`
- `/forum`
- `/proposal/:id`

### 6.3 P2：可后补的页面

- governance history list
- analytics public views
- search results pages
- wallet-specific / My Space pages

## 7. 页面类型级 SEO 方案

## 7.1 Docs

### 当前问题

- 内容主要在客户端加载；
- URL 为 hash route；
- 每篇文档没有独立可抓取 HTML；
- 页面 metadata 不区分具体文档。

### 目标方案

每篇 Docs 页面应拥有：

- 独立 pathname；
- 服务端输出正文 HTML；
- 独立 title / description；
- article-like structured data；
- breadcrumb；
- canonical；
- 与对应 artifact 的机器可读关联。

### title / description 建议

`<title>`

```text
{Doc Title} | PaperProof Docs
```

`<meta name="description">`

- 优先使用正文前 140-180 字摘要；
- 若文档有 manifest summary，则优先用 summary；
- 不直接用页面上大段 protocol footer。

### structured data 建议

可使用：

- `TechArticle`
- `Article`
- `BreadcrumbList`

可附加字段：

- `headline`
- `description`
- `dateModified`
- `author`
- `publisher`
- `mainEntityOfPage`

如果需要强调协议归属，可加：

- `isPartOf: PaperProof Docs`

## 7.2 Official Blog

### 当前问题

- Blog body 在浏览器端装载；
- 分享预览与搜索摘要缺乏页面级 metadata；
- Markdown package 资产存在，但对爬虫并不友好。

### 目标方案

每篇官方博客应提供：

- 独立 pathname；
- 服务端首屏 HTML；
- Open Graph / Twitter Card；
- `Article` structured data；
- canonical URL；
- 站内相邻文章与栏目页内链。

### structured data 建议

使用：

- `BlogPosting`

字段包括：

- `headline`
- `description`
- `datePublished`
- `dateModified`
- `author`
- `publisher`
- `image`
- `mainEntityOfPage`

如果没有独立封面图，可以先用：

- `PaperProof` 品牌图；
- 或协议白皮书中的体系图；
- 但应避免所有 blog 共用完全同一张无关图片。

## 7.3 Artifact Detail

### 当前问题

- 工件详情页是 PaperProof 最重要的协议展示页之一；
- 但对搜索引擎来说，当前页面标题、摘要、结构化标记、版本信息、下载目标都缺乏稳定 server-side 首屏表达；
- PDF/Markdown preview 并不等于 SEO 正文。

### 目标方案

对 artifact detail，应提供可抓取的：

- artifact title
- artifact description / abstract / summary
- artifact type
- author(s)
- published / updated
- version count / latest version
- license
- canonical artifact code
- direct download target
- comments / likes 等可选扩展信息

### 各 artifact type 的 structured data 推荐

- `preprint`：`ScholarlyArticle`
- `technical_report`：`ScholarlyArticle` 或 `TechArticle`
- `blog_post`：`BlogPosting`
- `dataset`：`Dataset`
- `software_release`：`SoftwareSourceCode` 或 `CreativeWork`
- `generic_file`：`CreativeWork`

### 版本信息的 SEO 处理原则

- 详情页 canonical 指向 series 页，而不是某个 version 子页；
- 页面应明确：
  - latest version number
  - updatedAt
  - version history count
- 若未来增加版本级 path，可再讨论：
  - `/artifact/:code/version/:n`

但第一阶段不建议展开为大量版本子页面，避免索引碎片化。

## 7.4 Type List / Explore

### 当前问题

- 列表页依赖前端加载；
- 对搜索引擎而言，列表页内容发现弱；
- Explore 本身可成为协议全貌入口，但当前首屏机器可读性不足。

### 目标方案

对于 `/explore` 与 `/type/:slug`：

- 服务端输出首屏列表 HTML；
- 每项保留标题、摘要、发布日期、artifact type、跳转链接；
- 列表分页使用 path 或 query，不依赖 hash；
- 提供分页 rel/canonical 策略。

### 分页 SEO 原则

- 每一页有独立 URL；
- canonical 指向当前页自身，不全部指回第一页；
- 对非常深的分页可考虑 `noindex,follow`，但第一页和前几页应可索引。

## 7.5 Forum

Forum SEO 优先级低于 Docs/Blog/Artifact，但仍值得做。

建议：

- 论坛列表页可轻 SEO；
- topic body 页应可收录；
- comments 不需要全部 SSR；
- 首屏只需：
  - topic title
  - topic body
  - basic metadata
  - comment count

structured data 可用：

- `DiscussionForumPosting`

## 7.6 Governance / Proposal

Proposal detail 适合作为独立公开页面收录，因为它体现协议演进与治理活性。

建议：

- `/proposal/:id` 提供 SEO HTML；
- 显示：
  - title
  - body
  - status
  - proposer
  - vote counts
  - created / deadline

structured data 可用：

- `CreativeWork`
- 或自定义最小 JSON-LD，不必过度拟合 schema。

## 8. Metadata 体系设计

## 8.1 全局必需项

所有公开 canonical 页面都应具备：

- `<title>`
- `<meta name="description">`
- `<link rel="canonical">`
- `og:title`
- `og:description`
- `og:url`
- `og:type`
- `og:image`
- `twitter:card`
- `twitter:title`
- `twitter:description`
- `twitter:image`

## 8.2 页面 title 规范

建议模板：

- 首页：`PaperProof | Verifiable Artifact Infrastructure on Sui and Walrus`
- Docs：`{Doc Title} | PaperProof Docs`
- Blog：`{Post Title} | PaperProof Blog`
- Artifact：`{Artifact Title} | PaperProof Artifact`
- Type list：`{Type Label} | PaperProof`
- Proposal：`{Proposal Title} | PaperProof Governance`

## 8.3 页面 description 规范

description 应遵守：

- 优先 140-180 字；
- 用自然语言摘要；
- 不直接堆 protocol IDs；
- 不把“Docs Path / Artifact Code / Series ID / Comments Tree”这种技术 footer 塞进 description；
- 每页唯一，不用统一模板糊过去。

## 8.4 Canonical 规范

必须避免这些问题：

- 同内容同时出现在 hash URL 和 path URL；
- 同一文档有多个 query 变体但都能索引；
- type list 排序参数导致重复内容页。

原则：

- path URL 为唯一 canonical；
- hash URL 不做 canonical 主体；
- 排序、过滤若不改变实体语义，必要时 canonical 回主列表；
- 分页若确有独立内容，则 canonical 保持当前页自身。

## 9. Structured Data 设计

### 9.1 全站级

建议增加：

- `Organization`：PaperProof Labs
- `WebSite`：PaperProof

可选：

- `SearchAction`

### 9.2 页面级

按页面类型输出对应 JSON-LD。

最低要求：

- Docs / Blog / Artifact detail 必须有 structured data
- Explore / Type list / Proposal detail 建议有

### 9.3 Protocol 元数据如何表达

PaperProof 的协议 footer 如：

- Artifact Code
- Series ID
- Comments Tree
- Walrus Blob
- Content Hash

这些不适合全部塞进通用 schema 顶层字段，但可以：

1. 作为页面正文中的可见 metadata 保留；
2. 在 JSON-LD 的 `identifier`、`sameAs`、`additionalProperty` 中有限表达；
3. 避免把过多链上字段变成噪音。

建议：

- `artifactCode` 进入 `identifier`
- `seriesId` 可进入 `additionalProperty`
- `contentHash` 不必默认暴露在 SEO 摘要层

## 10. Sitemap 与 Robots 设计

## 10.1 Sitemap 目标

必须生成机器可提交的 sitemap，至少覆盖：

- `/`
- `/explore`
- `/docs/...`
- `/blog/...`
- `/artifact/...`
- `/type/...`
- `/proposal/...`

### 10.2 Sitemap 分片建议

随着内容增长，建议分成：

- `sitemap-index.xml`
- `sitemap-docs.xml`
- `sitemap-blog.xml`
- `sitemap-artifacts.xml`
- `sitemap-types.xml`
- `sitemap-governance.xml`

### 10.3 lastmod 来源

建议按页面类型使用：

- Docs / Blog：latest version date 或 official manifest updatedAt
- Artifact：series latest version created_at
- Type list：该类型最近一项更新时间
- Explore：首页最近 refresh 时间

### 10.4 Robots 策略

建议新增 `robots.txt`，明确：

- 允许公开阅读页抓取；
- 禁止抓取无意义参数页；
- 禁止抓取临时 API 或内部接口路径；
- 提供 sitemap 地址。

示例原则：

- Allow:
  - `/`
  - `/docs/`
  - `/blog/`
  - `/artifact/`
  - `/type/`
  - `/proposal/`
- Disallow:
  - `/api/`
  - 某些纯交互页面如 `/publish`
  - 某些 query-heavy 内部页

## 11. 渲染架构设计

## 11.1 推荐架构

SEO 最终推荐方案：

```text
Caddy / edge
   ->
SEO public page renderer
   ->
paperproof-indexer-reference official/explore APIs
   ->
Sui / Walrus derived cache
```

前端继续存在，但公开页面应支持：

- server-rendered HTML
- hydration
- client-side enhancement

### 11.2 与当前 official content server rendering 的关系

当前已有的 `official-content-server-rendering-plan` 是很好的前置基础，但它还不是完整 SEO 方案，因为它：

- 仍以 hash route 为主；
- 仍由浏览器完成最终页面壳渲染；
- 重点是“正文更快加载”，不是“搜索引擎首屏可读 HTML”。

因此 SEO 方案应建立在其上，但增加：

- public path routes
- page HTML rendering
- metadata rendering
- sitemap / robots
- canonical

### 11.3 服务端渲染的数据边界

公开页 SSR/SSG 只负责：

- 内容正文
- 公共 metadata
- 公共列表
- 公共 protocol footers

不负责：

- 钱包状态
- 评论提交
- 点赞提交
- 发布表单
- 治理签名动作
- Copilot memory 私有状态

### 11.4 SSG / SSR / Hybrid 选择

推荐混合策略：

1. Docs / Official Blog

- 优先 SSG 或 ISR 风格缓存
- 因为内容相对稳定

2. Artifact detail / Type list / Proposal detail

- 优先 SSR + short cache
- 因为它们更依赖链上最新状态和索引刷新

3. Explore

- SSR 或 cached SSR

## 12. 页面内容与 SEO 的关系

## 12.1 不应为了 SEO 破坏内容层

SEO 优化不应要求：

- 改写 artifact body 结构来迎合爬虫；
- 删除协议 footer；
- 改掉桌面端 UI；
- 把技术内容降级成营销文案。

正确做法是：

- 保持内容语义不变；
- 用服务端把同样内容更早、更清晰地提供给爬虫。

## 12.2 对正文的轻量增强建议

可以做但不强制：

- 为 Docs / Blog 增加更清晰的一级标题层级；
- 为图增加 `alt`；
- 为表格增加更明确上下文；
- 为 Papers / Reports 增加摘要段；
- 为 artifact detail 提供简洁 description。

## 13. 内链设计

搜索引擎优化不只是渲染，还包括内部链接结构。

当前应加强：

1. Docs <-> Blog <-> Papers 的交叉链接

- 协议定位、竞品、白皮书、官方博客之间应形成引用网络

2. Blog -> Artifact detail

- 官方博客中引用工件时，应尽量使用 canonical path URL

3. Type list -> Artifact detail

- 类型列表应作为稳定索引入口

4. Docs 首页 / Getting Started / Introduction

- 应承担“新用户理解 PaperProof 是什么”的主入口职责

## 14. 性能与 SEO 的关系

SEO 不仅是能不能抓取，也与性能相关。

### 当前风险

- JS 主包较大；
- 首屏依赖客户端执行；
- 某些页面要再请求内容接口；
- 图片与预览资源可能偏重。

### 优化方向

- 公开页 HTML 首屏服务端输出；
- 拆分前端大 chunk；
- 图片优化与缓存控制；
- 对 Docs / Blog 正文采用服务端渲染结果缓存；
- 避免让搜索引擎必须执行大量客户端逻辑才看到内容。

## 15. 分享预览优化

虽然这不是纯 SEO，但与传播强相关，应统一纳入。

每个公开 canonical 页面应具备：

- `og:title`
- `og:description`
- `og:image`
- `og:url`
- `twitter:card=summary_large_image`

优先级高的页面：

- Docs
- Blog
- Artifact detail
- Proposal detail

## 16. 数据源与可信性原则

SEO 优化不能让官网失去协议可信边界。

必须坚持：

- Sui + Walrus 是协议事实源；
- indexer 是可重建的缓存和查询层；
- SEO HTML 是“协议派生页面”，不是新的 authority；
- 如果索引数据不可用，页面应优雅降级，而不是杜撰内容；
- canonical metadata 应来自已验证内容，而不是人工拷贝数据库字段。

## 17. 分阶段实施路线图

## Phase 0：基线审计

输出：

- 当前可收录 URL 清单
- 当前不可收录原因清单
- 重点页面优先级表

## Phase 1：URL 与 metadata 基础设施

实现：

- public path route 方案
- canonical 方案
- title / description service
- robots.txt
- sitemap generation
- OG / Twitter metadata

## Phase 2：Docs / Blog SEO 化

实现：

- `/docs/...` SSR/SSG
- `/blog/...` SSR/SSG
- 页面级 JSON-LD
- path route 对应的可抓取 HTML

这是最重要的第一批成果。

## Phase 3：Artifact / Type / Explore SEO 化

实现：

- `/artifact/:artifactCode`
- `/type/:slug`
- `/explore`

要求：

- 公开可抓取首屏
- 正确 metadata
- 正确 canonical

## Phase 4：Governance / Forum / Advanced Pages

实现：

- `/proposal/:id`
- `/forum/:id`
- `/forum`
- 其余适合公开收录的页面

## Phase 5：性能与监测

实现：

- chunk splitting
- crawling test
- Search Console / Bing Webmaster 接入
- sitemap 提交
- 页面抓取与收录监控

## 18. 按实现难度排序的 SEO 举措清单

本节将前面涉及的 SEO 工作，按“实现难度从低到高”重新整理，便于后续排期、拆任务和控制改造风险。排序逻辑以 `paperproof-app`、`indexer`、部署链路和现有公开页面架构为基础，综合考虑：

- 是否只需改 metadata 或静态文件；
- 是否需要改路由表达；
- 是否需要引入 server-assisted 首屏 HTML；
- 是否需要建立统一 SEO 渲染层；
- 是否会影响现有桌面端 UI 与交互主流程。

### 18.1 基础级：低风险、可先行落地

1. `robots.txt`

- 目标：明确允许搜索引擎抓取公开页面，屏蔽不该收录的技术性路径。
- 依赖：无复杂依赖，可直接在站点根路径提供静态文件。
- 难度判断：最低，几乎不影响现有代码结构。

2. `sitemap.xml` 生成与发布

- 目标：把 Docs、Blog、Artifact、Type、Forum、Proposal 等公开页面系统性暴露给搜索引擎。
- 依赖：需要整理公开 URL 规则和页面来源，但仍属于基础设施层工作。
- 难度判断：低，主要是生成逻辑和部署接线。

3. 页面级 `<title>`

- 目标：为每个公开页面输出独立、稳定、语义清晰的标题。
- 依赖：需要前端路由或 SEO 层知道页面对象的标题字段。
- 难度判断：低，收益高，是最基础的页面信号。

4. 页面级 `<meta name="description">`

- 目标：让搜索结果摘要和社交预览有更可控的说明文本。
- 依赖：需要为 Docs、Blog、Artifact、Proposal 等页面定义摘要提取规则。
- 难度判断：低，通常与标题一起实现。

5. Open Graph / Twitter Card

- 目标：改善 X、Telegram、微博、微信群等场景的链接预览卡片。
- 依赖：需要 title、description、canonical、preview image 的输出机制。
- 难度判断：低到中，metadata 规则稍多，但不涉及核心业务改造。

6. canonical 规则

- 目标：避免 hash 路由、path 路由、列表页分页、同内容多入口导致重复收录。
- 依赖：需要先定义“公开唯一 URL 形态”。
- 难度判断：低到中，属于规则设计工作，代码量不大，但必须严谨。

### 18.2 结构级：仍较轻，但开始影响公共链接组织

7. 内部链接与外部公开链接改用 path URL

- 目标：减少 `#/...` 作为公开分享主入口的情况，为收录和 canonical 奠定基础。
- 依赖：需要确定 path URL 方案，例如 `/docs/...`、`/artifact/...`、`/blog/...`。
- 难度判断：中低，涉及链接生成和分享入口调整，但不一定要求一次完成整站切换。

8. 轻量内容层 SEO 优化

- 目标：在不改变协议内容真相源的前提下，优化标题层级、首段摘要、链接文本、图片 alt、列表语义等。
- 依赖：需要梳理 Docs、Blog、Artifact 页面正文渲染规则。
- 难度判断：中低，更多是内容展示规范与模板完善。

9. 结构化数据 / JSON-LD

- 目标：让搜索引擎更容易理解 Docs、Blog、Artifact、Organization、Breadcrumb 等对象。
- 依赖：需要稳定的页面数据模型与 canonical URL。
- 难度判断：中，规则不复杂，但要按页面类型分别定义。

10. 更强的站内链接体系

- 目标：通过相关推荐、上级路径、系列页、类型页、作者页、官方专题页等提升可爬取性与主题聚合度。
- 依赖：需要 indexer 或 app 提供足够稳定的关联数据。
- 难度判断：中，既是 SEO 工作，也是信息架构工作。

11. 分页 SEO 规则

- 目标：让 Blog、Type、Forum、Explore 等列表页在分页后仍具备清晰的标题、canonical、noindex/index 策略。
- 依赖：需要先统一分页参数表达与 path 规则。
- 难度判断：中，工作量不大，但对列表类页面覆盖较广。

### 18.3 路由级：开始触及现有架构核心边界

12. path-route / hash-route 双栈兼容

- 目标：在不打断当前站点使用方式的前提下，引入对 path URL 的正式支持。
- 依赖：需要前端和服务器都能识别 path public routes。
- 难度判断：中到中高，因为会碰到现有 hash 路由历史包袱。

13. pathname 与内部 route-state 的稳定映射

- 目标：让 `/artifact/...`、`/docs/...` 这类 path URL 能无歧义映射到 app 内部状态、数据加载与导航逻辑。
- 依赖：通常和上一项联动，需要统一路由解析与反向生成。
- 难度判断：中高，若做得不稳，容易出现导航、刷新、分享、分页状态错乱。

### 18.4 首屏内容级：真正开始让爬虫看到页面主体

14. Explore / Type / Proposal / Forum topic 的 server first-screen

- 目标：让这些公开列表页或主题页在无 JS 下也至少可见主要标题、摘要、列表首屏内容。
- 依赖：需要最小化的服务端内容拼装能力。
- 难度判断：中高，但比正文型页面更容易，因为内容结构相对规则。

15. Docs / Official Blog 的 crawlable first-screen HTML

- 目标：让最重要的知识型长文页面在无 JS 条件下也能被看到主内容。
- 依赖：需要内容 API、正文模板、metadata 模板、path URL 协同工作。
- 难度判断：高，这是收录质量提升的第一道关键门槛。

16. Artifact detail 的 crawlable first-screen HTML

- 目标：让 artifact 标题、摘要、版本、内容入口、关键信息能在无 JS 下可见。
- 依赖：需要统一 artifact 数据模型，处理 markdown / PDF / file 等不同类型的首屏表达。
- 难度判断：高，因为 artifact 页面语义更复杂、内容类型更多。

### 18.5 架构级：把 SEO 从零散修补升级为系统能力

17. 面向公开页与交互页的混合渲染架构

- 目标：公开可读页面 SEO 化，交互页继续保留前端主导模式，避免对钱包、发布、评论、治理流程造成干扰。
- 依赖：需要明确哪些页面属于 public content pages，哪些页面属于 interactive app pages。
- 难度判断：高，属于站点级架构分层。

18. 基于 indexer / 官方内容接口的统一 SEO 渲染层

- 目标：避免 Docs、Blog、Artifact 等各自临时拼装，建立统一的公开页面渲染底座。
- 依赖：需要稳定的数据契约、模板契约和部署接入方式。
- 难度判断：很高，但这是长期最值得做的能力建设。

19. 按页面类型设计 SSG / SSR / Hybrid 缓存策略

- 目标：依据内容更新频率与页面性质，决定哪些适合静态预渲染，哪些适合按需服务端渲染，哪些适合增量更新。
- 依赖：需要统一 SEO 渲染层之后再细分缓存策略。
- 难度判断：很高，涉及性能、缓存一致性、部署、失效策略。

20. 性能层跟进优化

- 目标：在 SEO 架构落地后，继续压缩公开页面首屏成本，提升 crawler 与真实用户体验。
- 依赖：建立在前面公开页面渲染能力之上，包括资源拆分、图片策略、缓存策略、监测体系。
- 难度判断：最高之一，但应放在架构成型后做，避免前期过早优化。

### 18.6 推荐实施顺序

虽然上面是按“实现难度”排序，但真正的实施顺序应兼顾业务价值与结构前置关系。建议分三批推进：

第一批：先把最基础、最低风险的公共收录能力补齐

- `robots.txt`
- `sitemap.xml`
- 页面级 `title`
- 页面级 `description`
- Open Graph / Twitter Card
- canonical 规则

第二批：把公开 URL 与公开页面组织做对

- path URL 方案
- 内部链接改造
- 分页 SEO 规则
- JSON-LD
- 站内链接增强

第三批：把真正决定收录质量的“可抓首屏 HTML”做出来

- Docs / Official Blog crawlable first-screen HTML
- Artifact detail crawlable first-screen HTML
- Explore / Type / Proposal / Forum topic server first-screen
- 公开页 / 交互页混合渲染架构
- 统一 SEO 渲染层
- 页面级 SSG / SSR / Hybrid 缓存策略

其中最关键的四项是：

1. 给公开页面建立稳定 path URL；
2. 让 Docs / Official Blog 首屏 HTML 可抓；
3. 让 Artifact detail 首屏 HTML 可抓；
4. 建立统一 SEO 渲染层，避免后续演化成多套临时方案。

## 19. 成功标准

SEO 优化完成后，应至少满足：

1. 公开重要页面拥有不带 `#` 的 canonical URL
2. Docs / Blog / Artifact detail 在无 JS 条件下可见正文主内容
3. 每页有独立 title / description
4. 每页有正确 canonical
5. 至少 Docs / Blog / Artifact detail 具备 JSON-LD
6. 具备 sitemap 与 robots
7. 分享到 X / Telegram 有正确预览
8. 当前桌面端 UI 风格与交互主流程不被破坏
9. 协议真相源边界不被模糊

## 20. 风险与注意事项

1. 不要把整站 SEO 化误解为“整站 SSR 重写”

PaperProof 当前功能很多，真正需要 SEO 的是公开阅读页面，而不是所有交互页。

2. 不要让 SEO 层和 app 层生成两套内容真相

SEO 页必须和 app 页共享同一份协议派生内容逻辑。

3. 不要让 canonical 混乱

如果 path 与 hash 同时长期并列且不设 canonical，会导致收录混乱。

4. 不要一次把全站都改完

应按内容价值优先级逐步落地，否则风险过高。

5. 不要为 SEO 牺牲协议表达

PaperProof 的差异化就在 artifact protocol、versioning、Walrus content binding、governance、agent-readable artifacts。SEO 应该帮助这些内容被看到，而不是把它们抹平。

## 21. 最终建议

对 PaperProof 而言，最合适的方向不是把官网简单理解为“一个普通内容网站”，而是：

```text
把官网公开阅读页面升级为搜索引擎友好的协议内容入口，
同时保留当前前端在钱包交互、发布、评论、治理和 agent 使用场景中的优势。
```

因此，推荐的最终形态是：

- 公共内容页：SEO 友好的 path-based server-rendered pages
- 应用交互页：继续由前端负责的 protocol app
- 二者共用同一套协议派生数据与官方内容服务

这比“保持当前纯 hash SPA”更有传播力，也比“整站重写成传统 CMS”更符合 PaperProof 的协议定位。
