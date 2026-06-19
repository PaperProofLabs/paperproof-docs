Copyright (c) 2026 PaperProof Labs. All rights reserved.
SPDX-License-Identifier: LicenseRef-PaperProof-Interface-Source-Available

# PaperProof App 内容格式与渲染设计

本文记录 PaperProof App 对不同 artifact 类型的提交格式、前端操作、Walrus 存储、链上记录和阅读渲染策略。

核心原则是：协议层保持通用和可组合，官方静态网站提供更清晰的类型语义和用户体验约束。用户不需要理解 Walrus blob、content package、hash、manifest 或链上字段细节；用户只需要在对应页面完成自然的发布、编辑、阅读和评论操作。

## 1. 总体边界

PaperProof 协议层记录 artifact type、series、version、content hash、Walrus blob reference、content type、metadata、comments tree、likes book 和治理相关状态。

PaperProof App 作为官方静态网站，可以对不同 artifact type 施加更严格的上传和编辑规则。这些规则是官方应用的产品策略，不应被描述为协议唯一允许的内容形态。

推荐对外表达：

> The official PaperProof app applies content-format guidance for each artifact type. The protocol stores verifiable content commitments and Walrus references, while applications may enforce stricter publishing policies.

## 2. 内置类型与推荐内容格式

PaperProof 当前协议支持六类 artifact：

| Artifact type | 官方 App 推荐格式 | 用户体验 |
|---|---|---|
| `preprint` | PDF | 用户上传论文 PDF。 |
| `technical_report` | PDF | 用户上传技术报告 PDF。 |
| `blog_post` | Plain text 或 Markdown content package | 用户可以写纯文本，也可以写 Markdown、插入图片，点击发布。 |
| `dataset` | 压缩包或常见数据格式 | 用户上传 `.zip`、`.tar.gz`、`.csv`、`.json`、`.jsonl`、`.parquet` 等。 |
| `software_release` | 源码包、release 包、package archive，或 repo/hash metadata | 用户上传 release artifact，或填写 repository / commit / hash 信息。 |
| `generic_file` | 任意文件；也可承载特殊应用语义 | 用户上传任意文件。Forum topic 第一版可用此类型承载。 |

其中 `blog_post`、Docs 页面和 Forum topic 都可以使用 Markdown content package，但协议类别和应用语义不同。

## 3. Plain Text、Markdown 与 Rich Text

本文中的 `txt` 指 plain text，即纯文本。它不是 rich text。

术语定义：

- Plain text：纯文本，不含格式语义，最多保留换行。适合评论。
- Markdown：轻量标记语言，用 `.md` 文本表达标题、列表、链接、图片等结构。适合 Blog、Docs 和 Forum topic。
- Rich text：所见即所得的格式化编辑体验，底层可能是 HTML、JSON、ProseMirror document 或 Markdown。
- Markdown content package：PaperProof App 用于存储可验证文章/文档/帖子内容的包格式。

第一版不使用 rich text。Blog、Docs、Forum topic 支持 plain text 和 Markdown editor + Preview；评论只使用 plain text。

## 4. Markdown Content Package

Markdown content package 是一个由前端自动生成的内容包。用户不需要知道它的存在。

推荐结构：

```text
index.md
manifest.json
assets/
  cover.png
  image-1.png
  diagram.svg
```

`manifest.json` 示例：

```json
{
  "format": "paperproof.markdown_package",
  "version": 1,
  "entry": "index.md",
  "title": "PaperProof TypeScript SDK v0.2.3 Released",
  "author": "PaperProof Labs",
  "app_kind": "blog_post",
  "assets": [
    "assets/cover.png",
    "assets/image-1.png"
  ]
}
```

发布时，前端或 SDK 负责：

1. 读取用户在编辑器中写的 Markdown。
2. 收集用户插入的图片和附件。
3. 使用相对路径更新 Markdown，例如 `![Architecture](assets/architecture.png)`。
4. 生成 `index.md`、`manifest.json` 和 `assets/`。
5. 打包为内容包。
6. 上传到 Walrus。
7. 计算 package hash。
8. 调用 PaperProof SDK 发布或追加版本。
9. 在链上记录 Walrus reference、content hash、content type 和必要 metadata。

用户看到的是发布文章、文档或帖子，而不是上传压缩包。

## 5. Blog Post

`blog_post` 是正式文章、官方公告、教程、release notes、生态文章和长期可读内容的推荐类型。它应同时支持 plain text 和 Markdown。纯文本内容可以作为合法文章发布；实现上可以把纯文本保存为 `index.md`，因为 Markdown 本身兼容纯文本。

用户界面：

- `Title`
- `Author`
- `Tags`
- `Topic`
- Plain text / Markdown editor
- Preview
- Insert image
- Publish
- Add Version

用户输入可以是纯文本、纯 Markdown，也可以在编辑器里插入图片。前端将其自动转换为 Markdown content package 并上传 Walrus。对于纯文本文章，前端不需要额外生成 `.txt` 文件，可以直接把文本内容写入 `index.md`。

打开一个 `blog_post` 时，前端应：

1. 从链上读取 artifact 和 latest version。
2. 获取 Walrus blob id、content hash、content type 和 metadata。
3. 从 Walrus 下载 Markdown content package。
4. 校验 package hash 是否匹配链上 content hash。
5. 解包。
6. 读取 `manifest.json`。
7. 找到入口文件，默认 `index.md`。
8. 解析 Markdown。
9. 将相对图片路径映射到 package 内资源。
10. 渲染成适合阅读的文章页面。
11. 在下方展示 versions、download links、comments tree 和 likes。

如果 hash 校验失败，页面必须明确显示 content verification failed，不应继续当作可信内容展示。

## 6. Docs

Docs 可以先复用 `blog_post` 类型，不需要新增协议类型。

语义设计：

- 协议层：每个文档页面是一个 `blog_post` artifact。
- 前端层：Docs manifest 把一组 `blog_post` 编排成左侧目录和右侧正文。
- 内容层：每个文档页面都是 Markdown content package。

Docs manifest 只负责官方导航、排序、分组和置顶，不负责替代链上内容事实。

示例：

```json
{
  "sections": [
    {
      "title": "Protocol",
      "items": [
        {
          "title": "Overview",
          "artifact_code": "PaperProof-blog_post-..."
        },
        {
          "title": "Artifact Types",
          "artifact_code": "PaperProof-blog_post-..."
        }
      ]
    }
  ]
}
```

Docs 页面渲染策略：

- 左侧展示一级和二级目录。
- 右侧展示当前 Markdown page。
- 内容顶部展示 Docs 内相对路径。
- 每个一级和二级标题都可以对应一个独立 artifact。
- Add Version 仍然在 artifact detail 或对应管理入口中完成。

## 7. Official Blog

官方 Blog 也使用 `blog_post`。

Blog manifest 用于维护官方文章列表：

```json
{
  "posts": [
    {
      "title": "PaperProof TypeScript SDK v0.2.3 Released",
      "artifact_code": "PaperProof-blog_post-...",
      "author": "PaperProof Labs",
      "date": "2026-05-12",
      "topic": "SDK"
    }
  ]
}
```

Blog 页面：

- 居中列表。
- 展示 title、author、date、topic。
- 点击文章进入文章详情。
- 文章详情右上角提供 `Back to Blog`。
- 正文由 Markdown content package 下载、校验、解析和渲染。

## 8. Forum Topic

Forum topic 第一版推荐使用 `generic_file`，而不是 `blog_post`。

原因：

- `blog_post` 更适合官方文章、公告、教程和 Docs。
- Forum topic 是讨论主题、问题、提案草案、经验分享入口。
- 当前协议没有专门的 `forum_topic` 类型。
- `generic_file` 是更合适的兜底类型。

Forum topic 仍然可以使用 Markdown content package。

推荐 metadata：

```json
{
  "format": "paperproof.markdown_package",
  "version": 1,
  "app_kind": "forum_topic",
  "forum_category": "Builders",
  "entry": "index.md",
  "title": "How should I publish datasets?"
}
```

Forum 数据模型：

```text
Forum category
  -> Forum topic artifact: generic_file
  -> Topic body: Markdown content package
  -> Replies: artifact comments tree
  -> Likes / dislikes: artifact likes book
```

用户体验：

- 用户在 Forum 页面点击发帖。
- 输入 title、category 和正文。
- 正文支持 plain text 和 Markdown。
- 可插入图片。
- 发布后前端自动打包、上传 Walrus、调用 PaperProof SDK 发布 `generic_file` artifact。
- 帖子下方回复使用该 artifact 的 comments tree。

纯文本帖子也统一保存为 `index.md`。Markdown 兼容纯文本，因此不需要单独设计 txt package。

未来如果 Forum 成为核心协议能力，可以考虑新增 `forum_topic` artifact type，但第一版不需要。

## 9. Comments

评论不使用 Markdown content package。

评论第一版只支持 plain text。

原因：

- 评论是高频、轻量互动。
- 评论没有独立版本体系。
- 评论树重点是讨论关系，不是内容出版。
- Markdown 和图片会增加 XSS、伪装链接、外链、渲染复杂度和审核成本。
- 合约和 SDK 中的 comment 更像 protocol interaction，而不是 content artifact。

评论展示可以支持安全轻格式：

- 保留换行。
- 自动 linkify URL。
- 自动识别 artifact code 并链接到站内详情页。
- 缩略展示 Sui 地址。
- 展示 reply 层级关系。

评论不支持：

- 图片上传。
- Markdown 渲染。
- HTML。
- JavaScript。
- 附件。

产品语义：

```text
Forum topic = publishable content
Comment = plain text protocol interaction
```

## 10. 文件类型策略

官方 App 第一版建议：

### 10.1 Preprint

- 只允许 PDF。
- 推荐 MIME：`application/pdf`。
- 前端检查文件后缀和 MIME。
- PDF 是长期引用、下载和阅读的主要对象。

### 10.2 Technical Report

- 只允许 PDF。
- 推荐 MIME：`application/pdf`。
- 语义接近正式技术报告，强调稳定排版和长期可读性。


### 10.3 Blog Post

- 用户界面支持 plain text 和 Markdown editor。
- 纯文本内容是合法的 `blog_post`。
- 支持插入图片。
- 前端自动生成 Markdown content package。
- 链上可记录通用 content type，例如 `application/zip` 或更具体的 package content type。
- metadata 记录 `package_kind`、`entry`、`format_version` 等。

### 10.4 Dataset

允许：

- `.zip`
- `.tar.gz`
- `.csv`
- `.json`
- `.jsonl`
- `.parquet`
- 其他常见数据格式

大型、多文件数据集推荐打包后上传。

### 10.5 Software Release

允许：

- `.zip`
- `.tar.gz`
- `.tgz`
- source archive
- release artifact

可选字段：

- repository URL
- commit hash
- source hash
- package hash
- changelog

### 10.6 Generic File

- 允许所有格式。
- 可作为未分类文件、特殊应用内容、Forum topic 的承载类型。
- 前端应根据 metadata 决定是否以 Markdown package、普通下载文件或预览文件展示。

## 11. 安全渲染规则

Markdown 渲染必须安全处理：

- 禁止执行 HTML script。
- 默认 sanitize HTML，或第一版直接禁用 raw HTML。
- 图片路径优先限制为 package 内相对路径。
- 外部链接使用 `rel="noopener noreferrer"`。
- 不执行 package 中的 JavaScript。
- Mermaid、MathJax、代码高亮可作为受控能力逐步加入。
- hash 校验失败时，不渲染为可信内容。

评论渲染必须更严格：

- 全部按文本转义。
- 只做安全 linkify。
- 不渲染 Markdown。
- 不允许 HTML。

## 12. Download 与 Preview

Artifact detail 页面应同时提供：

- 阅读/预览区域：适合 PDF、Markdown package、图片或文本等。
- 下载链接：下载原始 Walrus 内容。
- Version list：展示历史版本。
- Comment tree：围绕 artifact series 的讨论。
- Likes / dislikes：围绕 artifact series 的轻量反馈。

对 Markdown content package，下载链接下载完整 package；阅读区域渲染 `index.md`。

对 PDF，阅读区域可嵌入 PDF preview；下载链接下载 PDF。

对 dataset 和 software release，第一版可以以下载为主，后续再加结构化 preview。

## 13. Add Version

Add Version 是 Publish 的受限子集。

不可改变：

- artifact code
- series id
- artifact type
- comments tree
- likes book
- core identity

可以改变：

- 新版本内容包或文件。
- content hash。
- Walrus blob reference。
- version-level metadata。
- changelog 或 version note。

对于 Markdown content package，Add Version 可以加载上一版内容作为编辑起点，但最终发布的是新的 package 和新的 version。

## 14. 推荐实现顺序

第一阶段：

1. `preprint` 和 `technical_report` 限制 PDF 上传。
2. `generic_file` 允许任意文件上传。
3. 评论保持 plain text。
4. Blog / Docs / Forum 页面先读取 manifest，占位展示。

第二阶段：

1. 实现 Markdown editor + Preview。
2. 实现图片插入和 package 生成。
3. 实现 Markdown content package 上传 Walrus。
4. 实现 `blog_post` 阅读页下载、校验、解包、渲染。

第三阶段：

1. Docs manifest 绑定链上 `blog_post` artifacts。
2. Official Blog manifest 绑定链上 `blog_post` artifacts。
3. Forum topic 使用 `generic_file` + Markdown package + comments tree。
4. 加入安全 preview、下载和版本对比。

## 15. 最终产品边界总结

- `blog_post` / Docs / Blog：支持 plain text 和 Markdown；实现上统一生成 Markdown content package。
- Forum topic：`generic_file` + Markdown content package + forum metadata。
- Comments：plain text protocol interaction。
- `preprint` / `technical_report`：PDF。
- `dataset`：压缩包或常见数据格式。
- `software_release`：源码包、release 包、repository/hash metadata。
- `generic_file`：兜底支持所有格式。

这套设计使 PaperProof App 既能保持协议级可验证性，又能提供接近正常内容产品的使用体验。
