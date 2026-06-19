Copyright (c) 2026 PaperProof Labs. All rights reserved.
SPDX-License-Identifier: LicenseRef-PaperProof-Interface-Source-Available

# PaperProof App 页面设计

## 1. 设计定位

PaperProof App 是一个静态、低维护、长期可运行的 PaperProof 协议前端。它不是营销落地页，也不是合约调试控制台，而是面向真实用户的内容发布、内容发现、版本查看、评论互动和治理参与界面。

页面设计应优先服务内容本身。用户进入网站后，首先看到的是不同类型的 PaperProof 工件，而不是 package id、合约对象、事件 JSON 或开发者配置。

页面上显示的主要文案使用英文；本文档中的设计说明使用简体中文。

页面上可展示的核心英文表达：

- `Explore`
- `Publish`
- `Governance`
- `My Space`
- `Docs`
- `Blog`
- `Forum`
- `Connect Wallet`
- `Search by artifact code`
- `Official Sui Mainnet`

## 2. 设计边界

本阶段先只考虑桌面端，不考虑移动端适配。页面布局、导航和信息密度都以桌面浏览器为准。

网站仍然是静态站，目标是可部署到 Walrus Sites。所有链上交互都应通过 `@paperproof/sdk-ts` 完成。前端不应手写 Move call target、package id、shared object id、事件类型字符串或对象解析逻辑。

## 3. 顶部导航

导航栏设置在页面顶部，而不是左侧。

顶部导航建议结构：

- 左侧：PaperProof logo + `PaperProof`
- 中间：主导航
  - `Explore`
  - `Publish`
  - `Governance`
  - `My Space`
  - `Docs`
  - `Blog`
  - `Forum`
- 右侧：
  - 搜索框：`Search by artifact code`
  - 钱包按钮：`Connect Wallet`

顶部导航需要始终保持简洁，不要把官方部署对象、package id、SDK 版本等开发者信息放在主导航中。

官方部署信息可放在页脚或高级弹窗：

- `Official Sui Mainnet`
- `Deployment Details`

页面底部统一显示协议归属文案：

- `Powered by PaperProof Protocol on Sui and Walrus`

该页脚应出现在所有顶层页面和详情页面底部，语气保持克制，不承担营销 hero 的职责。

## 3.1 Docs / Blog / Forum 导航定位

`Docs`、`Blog`、`Forum` 是 PaperProof App 的扩展内容入口，但它们不应和 `Explore`、`Publish`、`Governance`、`My Space` 混淆职责。

- `Docs` = canonical knowledge，用于协议介绍、开发教程、FAQ、代币经济、激励政策、免责声明等长期资料。
- `Blog` = official narrative，用于 PaperProof Labs 的官方更新、版本发布、路线说明和生态叙事。
- `Forum` = community discussion，用于社区主题讨论、开发者支持、治理预讨论和项目展示。

第一版中，三者都可以复用协议现有工件类别，而不是立即修改合约：

- `Docs` 的一级标题和二级标题都可以对应一个 PaperProof 工件，前端通过 manifest 或固定配置把目录项映射到 artifact code / series id。
- `Blog` 的每篇文章可以对应一个 Blog Post 或 Generic File 工件，列表由官方 manifest 负责排序和置顶。
- `Forum` 的每个主题帖可以对应一个 Generic File 工件，正文来自 Walrus，回复使用该工件的 comment tree。

GitHub manifest 只负责官方导航、排序、置顶和分类；链上 PaperProof 工件与 Walrus 内容才是内容事实来源。

## 3.2 PaperProof Copilot

`PaperProof Copilot` 是嵌入网站的浏览器侧智能体组件，用于帮助用户理解协议概念、准备页面操作、解释错误信息和获得安全提醒。

它不是自动交易机器人，也不是钱包代理。Copilot 只能解释和辅助，不得代替用户签名，不得自动提交交易，不得要求用户输入私钥、助记词、钱包恢复短语或任何原始钱包秘密。

交互形态：

- 默认在右下角显示 `Copilot` 按钮。
- 点击后打开右侧弹窗。
- 打开后的弹窗标题显示 `PaperProof Copilot`。
- 顶部 `Settings` 按钮用于显示或隐藏 Provider、Model、Base URL、API Key 等参数。
- 设置完成后再次点击 `Settings`，参数区隐藏，只保留对话界面。
- API Key 输入框右侧提供可见/隐藏切换按钮，默认隐藏。
- 用户可以关闭，关闭后恢复为默认右下角按钮。
- Copilot 状态跨各个 hash 子页面保持。

配置方式：

- 用户填写自己的大模型 API key。
- 第一版支持 `Gemini`、`Qwen / DashScope`、`OpenAI` 和 `Custom OpenAI-compatible`。
- API key 默认只保存在当前浏览器 session。
- 只有用户勾选 `Remember key in this browser` 时，才保存在 localStorage。
- PaperProof 不接收、不代理、不保存用户 API key。

Copilot 每次回答时应使用：

- PaperProof 全局提示词，基于 `paperproof-contracts/docs/PaperProof-Yellow-Paper.en.md` 的协议定位、边界、安全规则和 SDK 集成原则，以及本 `ui-design.md` 的全站信息架构、导航、页面关系和静态网站边界整理。
- 当前页面提示词，基于本 `ui-design.md` 中对应页面的职责和风险点整理。
- 当前页面运行时上下文。
- 最近聊天历史。
- 用户本次问题。

提示词组合顺序：

1. 全局提示词。
2. 当前页面提示词。
3. 当前页面动态数据，由预先脚本从本页结构化状态中提取；该数据可以为空。
4. 对话历史，刚开始为空，后续作为 Chat Completions 的多轮 user / assistant messages 注入。
5. 用户本次问题。

Copilot 应使用用户最新问题的语言回答。如果用户用中文问，则用中文答；如果用户用英文问，则用英文答；如果中英文混合，则使用主导语言，并保留必要的协议专有名词。

被动提醒应优先使用前端规则，不必所有提示都调用大模型。例如空评论、未连接钱包、余额不足、PPRF amount 格式错误等，应由前端直接拦截或提示；Copilot 负责进一步解释。

## 4. Explore 页面总体设计

Explore 是网站默认首页，也是 PaperProof 的内容发现入口。

它不应该以大段概念介绍开始，也不应该主要展示 raw events。它应该像一个内容目录和协议索引，让用户快速看到 PaperProof 当前有哪些类型的内容、每类最近发布了什么。

页面上可展示的标题：

- `Explore PaperProof`

页面上可展示的说明：

- `Browse recent artifacts across official PaperProof types.`

Explore 页面主体由六个 artifact type 卡片组成，每个类型一个框：

1. `Preprints`
2. `Blog Posts`
3. `Technical Reports`
4. `Datasets`
5. `Software Releases`
6. `Generic Files`

这六个框不是装饰性卡片，而是内容入口。每个框需要展示该类型近期发布工件的粗略情况。

六个协议类型的基础顺序固定。前端网站可以通过自己的配置项决定实际展示哪些类型、展示多少类型以及展示组合；也就是说，协议层支持六类，网站展示层可以选择任意类型组合和数量。

## 5. Explore 六类型卡片

每个类型卡片展示内容：

- 类型名称。
- 类型一句话说明。
- 最近发布的工件，最多展示 5 条。
- 每条工件展示粗略信息：
  - artifact code / 编号。
  - title。
  - publish date。
  - current version。
  - 可选：作者或 owner 简写。
- 卡片底部按钮：`View all`

示例 UI 文案：

```text
Preprints
Research drafts and early scholarly records.

PPRF-PRE-00012  Title of the preprint  2026-05-09
PPRF-PRE-00011  Another preprint       2026-05-08
PPRF-PRE-00010  Older record           2026-05-07

View all
```

六个类型卡片的英文标题建议：

- `Preprints`
- `Blog Posts`
- `Technical Reports`
- `Datasets`
- `Software Releases`
- `Generic Files`

六个类型说明建议：

- `Preprints`: `Research drafts and early scholarly records.`
- `Blog Posts`: `Long-form protocol, research, and community writing.`
- `Technical Reports`: `Formal reports with organizations, report numbers, and fields.`
- `Datasets`: `Structured research or public-interest datasets.`
- `Software Releases`: `Code releases, source hashes, package hashes, and changelogs.`
- `Generic Files`: `General durable files published through PaperProof.`

## 6. 类型详情页

用户点击某个类型卡片或 `View all` 后，进入该类型的详情页面。

类型详情页面不是 drawer，而是主页面级视图。原因是类型详情需要展示较多列表、筛选和排序，适合完整页面承载。

推荐路由：

- `#/type/preprints`
- `#/type/blog-posts`
- `#/type/technical-reports`
- `#/type/datasets`
- `#/type/software-releases`
- `#/type/generic-files`

页面上可展示的标题：

- `Preprints`
- `Blog Posts`
- `Technical Reports`
- `Datasets`
- `Software Releases`
- `Generic Files`

类型详情页面展示：

- 类型名称。
- 类型说明。
- 当前类型的发布总数，如果可得。
- 最近发布列表。
- 排序：
  - `Newest`
  - `Most Discussed`
  - `Most Liked`
  - `Recently Updated`
- 工件列表。

第一版类型详情页不提供 keyword / field 筛选。保持列表简单，降低静态站维护和 indexer 依赖。

工件列表每行展示：

- artifact code。工件编号统一展示为 artifact code。
- title。
- authors / owner。
- publish date。
- current version。
- comment count。
- like count。
- latest update date。

点击某个工件后，进入工件具体信息页。

## 7. 工件具体信息页

工件具体信息页是 PaperProof App 最重要的内容页面。用户搜索工件编号后，也应进入这个页面。

推荐路由：

- `#/artifact/<artifact-code>`
- `#/artifact/<series-id>`

如果用户通过 artifact code 搜索，优先显示 code 路由；如果只能拿到 series object id，也允许 series id 路由。

页面上可展示的核心标题区：

- artifact title。
- artifact code。
- artifact type。
- status。
- current version。
- publish date。
- last updated date。
- canonical / official indicator。

主要按钮：

- `Download`
- `Open Walrus Blob`
- `Copy Link`
- `Open in Explorer`
- `Add Version`
- `Comment`
- `Like`

其中 `Add Version` 必须位于工件具体信息页上。这是作者在查看已有工件时最自然的后续操作，不应藏在 Publish 页面，也不应只作为开发者工具出现。

点击 `Add Version` 后，进入独立的追加版本页面，而不是在当前详情页内展开一个很长的表单。追加版本涉及文件上传、Walrus 内容处理、版本元数据、费用和钱包签名，信息量较大，独立页面更清晰。

推荐路由：

- `#/artifact/<artifact-code>/add-version`
- `#/artifact/<series-id>/add-version`

## 8. 工件信息页内容结构

工件具体信息页建议采用主内容区 + 右侧信息栏。

主内容区：

1. `Abstract` 或 `Description`
2. `Current Version`
3. `Version History`
4. `Comments`

右侧信息栏：

1. `Artifact`
2. `Authors`
3. `License`
4. `Field / Tags / Keywords`
5. `Content`
6. `Signals`

### 8.1 Abstract / Description

Preprint 和 Technical Report 展示 `Abstract`。

Blog Post、Dataset、Generic File 展示 `Description` 或 `Summary`。

Software Release 展示 `Changelog` 和 repository 信息。

页面上可展示的英文标题：

- `Abstract`
- `Description`
- `Summary`
- `Changelog`

### 8.2 Current Version

展示当前版本的具体信息：

- version number。
- version object id。
- content hash。
- Walrus blob id。
- Walrus blob object id。
- content type。
- created date。
- metadata extensions。

页面上可展示的英文标题：

- `Current Version`
- `Content Hash`
- `Walrus Blob`
- `Blob Object`
- `Content Type`

### 8.3 Download 链接

工件详情页必须包含清晰的下载入口。

下载入口建议分为：

- `Download`
- `Open Walrus Blob`
- `Copy Blob ID`

如果前端能够通过 SDK/Walrus 读取内容，则 `Download` 直接下载文件。

第一版 `Download` 应能直接下载内容，例如 PDF、压缩包、文本文件或软件包。`Open Walrus Blob` 作为辅助入口，不替代下载按钮。

下载区不应只展示 blob id，用户需要明确知道哪里可以拿到内容。

## 9. Version History

版本历史是 PaperProof 的核心能力之一，不能隐藏在 raw JSON 中。

页面上可展示的英文标题：

- `Version History`

每个版本展示：

- version number。
- title / note / changelog。
- created date。
- content hash 简写。
- Walrus blob id 简写。
- `Download`
- `View details`

点击 `View details` 后，可以打开版本详情 drawer 或在当前页面展开。

版本详情展示：

- version object id。
- full content hash。
- blob id。
- blob object id。
- content type。
- version metadata。
- explorer link。

## 10. Add Version 页面

Add Version 页面用于给已有工件追加新版本。它不是创建新工件，因此必须清楚区分“继承的核心信息”和“本次版本可填写的信息”。

Add Version 页面的填写项和上传项应当是 Publish 页面的子集。因为追加版本不能改变工件身份，只能为同一个 series 增加新的 version。凡是决定 artifact identity 的字段，都不应在 Add Version 页面允许修改，但应始终展示给用户确认。

页面上可展示的英文标题：

- `Add Version`

页面上可展示的英文说明：

- `Upload new material and append a new version to this artifact.`

### 10.1 入口

入口位于工件具体信息页的顶部操作区：

- `Add Version`

只有当用户连接钱包后，按钮才应进入可签名流程。若未连接钱包，点击后提示连接钱包。

如果能判断当前钱包不是 owner，应明确提示：

- `Only the artifact owner can add a new version.`

如果暂时无法在前端可靠判断 owner，也可以允许进入页面，但在签名前提示该操作可能因权限不足失败。

### 10.2 页面布局

Add Version 页面建议采用两栏布局：

左侧主流程：

1. `New Content`
2. `Common Version Fields`
3. `Type-specific Version Fields`
4. `Review and Sign`

右侧信息栏：

- 当前工件编号。
- 当前工件标题。
- artifact type。
- current version。
- owner。
- 不可修改字段说明。

右侧信息栏应在 Add Version 页面全程可见，帮助用户始终确认自己是在给哪个工件追加版本，而不是创建新工件。

### 10.3 不可修改核心信息

追加版本不能改变工件的核心身份信息。

必须明确展示为 locked fields：

- artifact code / 编号。
- series id。
- artifact type。
- original creator / owner，除非另有 owner transfer 流程。
- comments tree id。
- likes book id。
- existing version history。

页面上可展示的英文表达：

- `Locked artifact identity`
- `These fields cannot be changed when adding a version.`

例如，Preprint 的追加版本可以更新本版本内容、标题、abstract 等版本级信息，但不能把原工件变成另一种 artifact type，也不能改变 artifact code。

### 10.4 Add Version 是 Publish 的受限子集

Publish 页面中有些字段属于 artifact identity，有些字段属于 version content。Add Version 页面只允许填写 version content 相关字段。

Add Version 页面不应要求用户重新选择 artifact type。artifact type 来自当前工件，并且锁定展示。

Add Version 页面不应允许修改：

- artifact code。
- artifact type。
- series id。
- comments tree id。
- likes book id。
- 初始发布时间。
- 已存在版本记录。
- series owner，除非走独立 owner transfer 流程。

Add Version 页面可以允许填写或上传：

- 新版本文件或内容。
- 新版本 content hash。
- 新版本 Walrus blob。
- 新版本 content type。
- 新版本 metadata。
- 该 artifact type 对应的版本级字段。

### 10.5 可填写的新版本信息

可填写字段应根据 artifact type 动态变化。

通用字段：

- 新文件或新材料。
- content hash。
- Walrus blob id。
- Walrus blob object id。
- content type。
- version metadata。
- version note，如果合约或 indexer 层支持。

Preprint 新版本字段：

- title。
- abstract。
- authors。
- keywords。
- field。
- license。
- page count。

Generic File 新版本字段：

- title。
- description。
- filename。
- file size。
- license。
- content type。

Software Release 新版本字段：

- project name。
- version name。
- source hash。
- package hash。
- changelog。
- repository url。
- license。

页面上可展示的英文表达：

- `New Content`
- `Version Metadata`
- `Content Hash`
- `Walrus Blob ID`
- `Walrus Blob Object ID`
- `Review and Sign`

### 10.6 上传与 Walrus

Add Version 页面应支持上传新版本材料。

第一版默认也应尽量支持自动上传 Walrus。用户在 Add Version 页面选择新版本文件后，网站应完成 hash 计算、Walrus 上传、blob 信息回填和 add-version 交易构造。manual mode 只作为高级备用模式，不作为主流程。

默认流程：

1. 用户选择文件。
2. 浏览器本地计算 hash。
3. 通过 SDK ContentService 上传到 Walrus。
4. 展示 blob id、blob object id、digest。
5. 用户确认。
6. 构造 add-version 交易。
7. 浏览器钱包签名。

如果浏览器端 Walrus 上传遇到技术阻塞，可以保留高级 manual mode，允许手动填写：

- `Content Hash`
- `Walrus Blob ID`
- `Walrus Blob Object ID`
- `Content Type`

但 UI 应明确这是 manual mode，并提示它是备用路径。

### 10.7 Review and Sign

签名前展示：

- artifact code。
- old current version。
- new version number，若可推断。
- content hash。
- Walrus blob。
- version metadata。
- fee / payment coin。

按钮：

- `Build Transaction`
- `Sign and Submit`

交易成功后展示：

- `Transaction Digest`
- `New Version ID`
- `Series ID`
- `View Artifact`
- `Open in Explorer`

交易成功后应回到工件具体信息页，并刷新 Version History。

## 11. Comments 评论树展示

工件详情页下部展示评论树。

页面上可展示的英文标题：

- `Comments`

评论树应展示：

- total comments。
- tree status。
- comment list。
- reply nesting。
- author。
- created time。
- comment status。
- reply button。
- add comment composer。

评论超过 25 条时分页。每页最多展示 25 条评论。这里的 25 条指评论节点数量，而不是只展示 25 个顶层 thread。分页时需要尽量保持 reply 关系可理解，必要时可在评论项中提供 `View replies`。

评论状态建议显示：

- `Active`
- `Hidden`
- `Deleted`

评论树需要避免展示为纯 JSON。即使第一版只支持加载部分 comment id，也应设计为树形结构。

评论输入区：

- `Write a comment`
- `Reply`
- `Post Comment`
- `Post Reply`

Reply 交互应保持用户输入不丢失。点击 `Reply` 后，评论框切换为回复状态；浏览器钱包弹出、签名等待或交易 pending 期间，textarea 中的内容不应被重渲染清空。交易成功后应清空输入并退出回复状态。

评论交易成功后，页面应立即重新读取对应 comments tree 和 comment node，并把新评论显示到当前工件详情页中，不要求用户手动刷新页面。评论内容应通过 SDK/gRPC 读取链上 comment node；event fallback 只用于临时占位，不能长期显示为 `Comment event found...`。

如果评论需要费用，应在签名前展示费用说明。

如果评论树暂停或锁定，应显示：

- `Comments are locked`

## 12. 搜索框

页面右上角，低于导航栏的位置，需要有一个搜索框。这个搜索框用于搜索工件编号。

注意：它不是全站关键词搜索，也不是 object id 高级查询。第一版优先定位为 artifact code 搜索。

页面上可展示的英文 placeholder：

- `Search by artifact code`

搜索行为：

1. 用户输入 artifact code。
2. 点击搜索或按 Enter。
3. 如果找到唯一工件，进入工件具体信息页。
4. 如果找不到，显示明确提示。
5. 如果未来支持模糊搜索，可展示候选列表。

错误提示英文：

- `Artifact not found.`
- `Check the artifact code and try again.`

搜索框位置：

- 顶部导航栏下方。
- 页面右上角。
- 在 Explore、类型详情、工件详情页都可见。

## 13. Publish 页面

Publish 页面用于发布新工件。当前重点是 preprint，但需要为六种类型保留统一入口。

页面上可展示的标题：

- `Publish`

页面布局建议：

- 顶部选择 artifact type。
- 默认选中 `Preprint`。
- 表单根据类型变化。
- 右侧显示发布前检查和费用信息。

类型选择：

- `Preprint`
- `Blog Post`
- `Technical Report`
- `Dataset`
- `Software Release`
- `Generic File`

发布流程：

1. `Content`
2. `Metadata`
3. `Review`
4. `Sign`

Publish 页面数据应分成两大块：

1. 各类型通用数据。
2. 各类型自己的数据。

这两块在 UI 上应有明确分区，不要把所有字段混在一起。

页面上可展示的英文分区标题：

- `Common Fields`
- `Type-specific Fields`

### 13.1 Publish 通用字段

所有 artifact type 发布时都需要的通用字段包括：

- artifact type。
- title 或可展示名称。
- license。
- content hash。
- Walrus blob id。
- Walrus blob object id。
- content type。
- series metadata。
- version metadata。
- payment coin，如果需要。

页面上可展示的英文表达：

- `Common Fields`
- `Content`
- `License`
- `Content Hash`
- `Walrus Blob ID`
- `Walrus Blob Object ID`
- `Series Metadata`
- `Version Metadata`

### 13.2 Publish 类型字段

用户选择不同 artifact type 后，页面应自动切换类型字段。

`Preprint` 类型字段：

- abstract。
- authors。
- keywords。
- field。
- page count。

`Blog Post` 类型字段：

- summary。
- author name。
- tags。

`Technical Report` 类型字段：

- abstract。
- authors。
- organization。
- report number。
- field。
- page count。

`Dataset` 类型字段：

- description。
- authors。
- field。
- schema hash。
- record count。

`Software Release` 类型字段：

- project name。
- version name。
- source hash。
- package hash。
- changelog。
- repository url。

`Generic File` 类型字段：

- description。
- filename。
- file size。

页面上可展示的英文表达：

- `Type-specific Fields`
- `Preprint Details`
- `Dataset Details`
- `Software Release Details`

### 13.3 Publish 与 Add Version 的关系

Add Version 页面应参考 Publish 页面的结构，但不能照搬全部字段。

共同点：

- 都需要 content / Walrus 信息。
- 都需要 version metadata。
- 都需要根据 artifact type 显示类型字段。
- 都需要 review and sign。

差异：

- Publish 需要选择 artifact type，Add Version 不允许选择 artifact type。
- Publish 创建新的 series，Add Version 使用既有 series。
- Publish 创建新的 comments tree 和 likes book，Add Version 继续使用既有 comments tree 和 likes book。
- Publish 可以填写 series metadata，Add Version 通常不应修改 series metadata，除非另有明确的 series metadata update 流程。
- Publish 生成新的 artifact code，Add Version 必须沿用既有 artifact code。
- Publish 是创建身份，Add Version 是追加内容。

因此 Add Version 页面应持续展示 locked identity，并只开放 Publish 页面中的 version-level 子集。

发布成功后展示：

- `Transaction Digest`
- `Artifact Code`
- `Series ID`
- `Version ID`
- `Comments Tree ID`
- `Likes Book ID`
- `View Artifact`

## 14. Governance 页面

Governance 页面用于查看和参与治理，不应和 Explore 混在一起。

页面上可展示的标题：

- `Governance`

页面右上侧需要有明显的 `Create Proposal` 按钮。点击后进入独立填写页，而不是在 Governance 首页展开表单。

推荐路由：

- `#/governance/create`

Governance 首页主体采用上下布局，而不是左右布局：

上方：正在进行中的投票信息。

- 标题：`Active Votes`
- 只展示已经读取到链上 proposal object 且状态确认为 active 的 proposal。
- 不应把只有 event seed、尚未读取对象详情的 proposal 当作真实 active proposal 展示。
- 每条展示 title、proposal id、status、yes/no votes、end epoch。
- 如果 end epoch 尚未从对象读取到，不应显示成可操作的真实 active vote。
- 点击后进入 proposal detail 页面，可以投票。

下方：历史投票记录。

- 标题：`Voting History`
- 展示已经完成、取消、失败或执行过的 proposal。
- 每条展示 title 和投票结果。
- 每页显示 5 条，底部显示分页。
- 点击后进入 proposal detail 页面查看详情。

页面上可展示的英文表达：

- `Create Proposal`
- `Active Votes`
- `Voting History`
- `Passed`
- `Rejected`
- `Executed`
- `Canceled`
- `Open Proposal`

Proposal detail 页面需要展示：

- title。
- description。
- proposal id。
- proposal object id。
- proposal type。
- action type。
- status。
- vote result。
- yes votes。
- no votes。
- start epoch。
- end epoch。
- payload summary。

Proposal detail 页面动作：

- `Vote Yes`
- `Vote No`
- `Finalize`
- `Execute`
- `Claim`

投票表单面向普通用户时不应要求填写 PPRF coin object id。用户应填写 `PPRF amount`，前端通过 SDK coin helper 自动查询、选择、合并或拆分 PPRF coin，再构造 `vote_yes` / `vote_no` 交易交给浏览器钱包签名。

Proposal detail 的结果区域下方应显示当前钱包与该 proposal 相关的锁定资金：

- 区块标题：`My Locked Funds`
- 展示格式：`Yes (xx / XX PPRF)` 或 `No (xx / XX PPRF)`
- 其中 xx 是当前仍锁定、尚未 claim 的 PPRF 数量，XX 是该地址为该 proposal 锁定过的总 PPRF 数量。
- 如果 xx 不为 0 且 proposal 已结束，显示 `Claim Locked PPRF`，点击后构造 claim 交易并由浏览器钱包签名。
- 如果 proposal 尚未结束，点击 claim 提示 `Locked PPRF can be claimed after this proposal is finalized or otherwise leaves the active voting state.`。

Create Proposal 页面需要展示：

- title。
- description。
- proposal type。
- action type。
- payload。
- PPRF stake coin。
- `Review and Sign`

## 15. My Space 页面

My Space 是钱包连接后的个人工作区。

页面上可展示的标题：

- `My Space`

主要内容：

- wallet address。
- 用户发布的工件。
- 用户评论过的工件。
- 用户点赞过的工件。
- 用户参与过的 proposal。
- PPRF / SUI / WAL 余额。

第一版即使没有完整 indexer，也不应以 manual comment / like / vote utilities 为中心。My Space 应优先展示用户自己的账户和参与记录：

- wallet address。
- PPRF / SUI / WAL balances。
- 用户参与过的 governance votes。
- 用户发布的 artifacts。

布局建议：

- 顶部一行左侧为 `Wallet`，右侧为 `Voting Records`，两者底部对齐。
- `Published Artifacts` 位于二者下方，横跨整行。
- `Voting Records` 每页显示 5 条。
- `Published Artifacts` 每页显示 10 条。

`Assets` 区域应支持点击刷新余额。余额读取优先使用 SDK 的 gRPC provider；如果浏览器 gRPC balance fetch 失败，可使用 GraphQL coin 查询聚合余额作为兜底，但不回退 JSON-RPC。

`Voting Records` 行应展示 proposal、投票状态、投票方向与锁定资金、结果。投票方向与锁定资金格式为：

- `Yes (xx / XX PPRF)`
- `No (xx / XX PPRF)`

其中 xx 是仍锁定未取回资金，XX 是该投票总锁定资金。状态可包括 `Voting`、`Claimable`、`Claimed`、`Locked?`。

整体设计应以用户自己的内容和参与记录为中心，而不是工具表单为中心。

## 16. Docs 页面

Docs 页面是 PaperProof 协议的长期知识库，页面显示文案使用英文，目录说明和数据来源在实现层保持清晰。

Docs 页面采用左右结构：

- 左侧是各级标题导航。
- 右侧是当前文档内容展示。
- 右侧内容顶部显示 Docs 内的相对目录，例如 `Docs / Developers / Frontend Integration`。

一级目录建议固定为：

- `Protocol`
- `Developers`
- `Economics`
- `Legal`

二级目录建议固定为：

- `Protocol`: `Overview`、`Architecture`、`Artifact Model`、`Governance`
- `Developers`: `TypeScript SDK`、`Python SDK`、`Rust SDK`、`Frontend Integration`
- `Economics`: `Tokenomics`、`Incentives`、`Fees`
- `Legal`: `Disclaimer`、`Terms`

每一个一级标题和二级标题都允许对应一个 PaperProof 工件。第一版如果没有填入 artifact code，则显示空状态，不造假数据。

## 17. Blog 页面

Blog 页面用于 PaperProof Labs 官方博客发布。它不是 Explore 的替代入口，也不是社区论坛。

Blog 首页采用居中列表：

- 博客题目。
- 作者，第一版固定显示 `PaperProof Labs`。
- 发布日期。
- 内容类别，例如 `Protocol`、`Product`、`Ecosystem`、`Developer`、`Governance`、`Release`。
- 简短摘要。

点击一篇博客后进入博客正文页。正文页右上角显示 `Back to Blog` 按钮，正文主体后续从 PaperProof 工件与 Walrus 内容加载。

第一版允许列表为空或使用官方草稿占位，但不能把未上链内容伪装成已经上链的 PaperProof 工件。

## 18. Forum 页面

Forum 页面用于社区讨论。它可以复用 Generic File 工件作为主题帖，每个主题帖的评论区使用该工件的 comment tree。

Forum 首页采用若干大小不同的讨论块，块内展示该分区下的帖子列表。第一版固定分区为：

- `Protocol Discussion`
- `Developer Support`
- `Governance`
- `Ideas & Proposals`
- `Showcase`
- `General`

每个帖子行应展示：

- 标题。
- 作者或发布地址。
- 最近活跃时间。
- 评论数。
- likes / dislikes 数量。

点击帖子后进入帖子详情页。帖子详情页展示正文、likes / dislikes 数量和评论树。第一版如果没有绑定主题工件，则显示清晰空状态。

## 19. 官方部署信息

官方部署信息不作为主页面。它是高级信息。

入口：

- `Official Sui Mainnet`
- `Deployment Details`

展示内容：

- `Publishing Package`
- `Comments Package`
- `Governance Package`
- `Root`
- `Type Registry`
- `Governance Vault`
- `Governance Config`
- `Fee Manager`
- `PPRF Coin Type`

这些信息对开发者和高级用户重要，但普通用户主要关心 artifact 是否 canonical。

全站底部使用统一页脚文案：

- `Powered by PaperProof Protocol on Sui and Walrus`

这里的 `PaperProof Protocol` 表示协议主体，`Sui` 表示链上身份、状态、治理和事件层，`Walrus` 表示原始内容存储层。

## 20. 视觉方向

整体视觉应是可信、克制、内容优先。

推荐：

- 顶部导航简洁。
- Explore 六类型卡片清晰。
- 工件列表信息密度适中。
- 工件详情页像学术记录页，而不是 Web3 资产页。
- 评论树有清晰层级。
- 下载入口明显。

避免：

- 大面积营销 hero。
- 左侧复杂控制台导航。
- raw JSON 主导页面。
- 多层嵌套卡片。
- 过度 token 化、投机化表达。

## 21. 路由模型

顶层路由：

- `#/explore`
- `#/publish`
- `#/governance`
- `#/space`
- `#/docs`
- `#/blog`
- `#/forum`

类型详情路由：

- `#/type/preprints`
- `#/type/blog-posts`
- `#/type/technical-reports`
- `#/type/datasets`
- `#/type/software-releases`
- `#/type/generic-files`

工件详情路由：

- `#/artifact/<artifact-code>`
- `#/artifact/<series-id>`

追加版本路由：

- `#/artifact/<artifact-code>/add-version`
- `#/artifact/<series-id>/add-version`

辅助详情：

- `#/proposal/<proposal-id>`
- `#/blog/<post-id>`
- `#/forum/<topic-id>`
- `#/version/<version-id>`
- `#/tree/<tree-id>`

## 22. MVP 范围

第一版 MVP 应优先实现：

- 顶部导航。
- logo。
- 右上角 artifact code 搜索框。
- Explore 六类型卡片。
- 每个类型展示近期发布工件概况。
- 类型详情页。
- 工件详情页。
- 下载入口。
- 版本历史。
- 工件详情页上的 `Add Version` 按钮。
- Add Version 独立页面。
- 评论树展示。
- Publish 页面。
- Governance 页面。
- My Space 页面。
- Docs 页面。
- Blog 页面。
- Forum 页面。
- 钱包连接和浏览器钱包签名。
- 所有链上调用通过 TS SDK。
- Governance 投票使用 PPRF amount 输入并由 SDK 自动选择/拆分 coin。
- Proposal detail 展示并支持 claim 当前钱包的 locked voting funds。
- My Space 展示 Wallet、Voting Records、Published Artifacts，并支持余额点击刷新。
- 页面底部统一显示 `Powered by PaperProof Protocol on Sui and Walrus`。

## 23. 依赖与数据来源

如果没有 indexer，Explore 的“每类型近期发布”需要通过 SDK 查询 canonical events 并按 artifact type 聚合。

如果有 indexer，推荐由 indexer 提供：

- artifact code。
- title。
- artifact type。
- publish date。
- current version。
- comment count。
- like count。
- latest update date。

前端仍应保留链上对象读取能力，用于打开具体 artifact 和验证关键状态。

事件查询和历史检索默认通过 SDK 的 GraphQL query provider 或 fallback query provider 完成；对象、dynamic field、余额、coin 查询优先走 SDK 的 gRPC provider。浏览器环境中如果 gRPC balance fetch 失败，可以用 GraphQL coin 查询兜底。评论正文和评论树完整性应以 comments tree / dynamic field 对象读取为准，event 只作为发现和临时占位来源。

Docs、Blog、Forum 第一版可以通过固定配置或 GitHub manifest 获取官方 ID 列表，再使用 SDK 从链上和 Walrus 读取内容。manifest 不应替代链上工件，只用于前端导航、分类、排序和置顶。

## 24. 待确认问题

暂无。
