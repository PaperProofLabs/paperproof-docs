Copyright (c) 2026 PaperProof Labs. All rights reserved.
SPDX-License-Identifier: LicenseRef-PaperProof-Interface-Source-Available

# 基于 PaperProof 协议的动态网站设计

本文说明如果 PaperProof App 从静态网站进一步演进为动态网站服务，应如何组织 frontend、dynamic backend、Rust reference indexer、数据库、Walrus 内容缓存、搜索和 analytics。

核心原则是：Sui 和 Walrus 是协议事实源，indexer 是可重建的查询与聚合层，dynamic backend 是产品 API 与缓存层，frontend 是交互和展示层。动态网站不应替代协议事实源，也不应让前端和后端各自形成互相冲突的业务真相。

## 1. 为什么需要动态网站

当前静态网站已经具备一部分轻量 indexer 能力：

- 查询 PaperProof events。
- 拼装近期 artifacts。
- 查询 comments tree。
- 展示 governance proposals。
- 展示 wallet 相关局部数据。
- 在当前页面做少量 verified read。

这些能力足以支撑早期演示和小规模使用，但随着协议内容增多，静态前端会遇到明显边界：

- 浏览器不适合做全历史 backfill。
- 浏览器无法可靠持久化 cursor。
- 浏览器无法承担全站搜索和 analytics。
- 公共 RPC / GraphQL provider 会有 rate limit。
- Walrus package 下载、hash verify、preview cache 会越来越重。
- My Space、Governance History、Forum、Blog、Docs 列表都需要更快的分页和聚合。
- Airdrop snapshot、积分、排行榜、治理统计需要可复算数据管道。

因此动态网站不是对 Web3 原则的倒退，而是把链上事实转化为用户可用产品体验的常规工程层。

## 2. 总体架构

推荐架构：

```text
Sui / Walrus
   |
   v
PaperProof Rust Reference Indexer
   |
   v
PostgreSQL / cache / search / analytics
   |
   v
Dynamic Web Backend
   |
   v
PaperProof Frontend
```

更细一点：

```text
Sui GraphQL / gRPC / Checkpoints
        |
        v
Rust Indexer
  - backfill
  - tail
  - raw events
  - verified/canonical filtering
  - normalized projection
  - replay
  - Walrus enrichment
  - analytics
        |
        v
PostgreSQL + object cache + search index
        |
        v
Dynamic Backend
  - product API
  - caching
  - manifest composition
  - markdown package preview
  - API rate limiting
        |
        v
Frontend
  - wallet signing
  - publish/vote/comment flows
  - page rendering
  - optimistic updates
  - fallback SDK reads
```

## 3. 各层职责

### 3.1 Sui

Sui 是协议状态事实源。

它负责承载：

- `PaperProofRoot`
- `TypeRegistry`
- `ArtifactSeries`
- typed `VersionRecord`
- `CommentsTree`
- `LikesBook`
- governance objects
- fee configuration
- canonical events
- ownership and version state

动态网站不得把自己的数据库状态当作最终事实。数据库状态必须可由链上对象和事件重新构建。

### 3.2 Walrus

Walrus 是大内容事实源。

它承载：

- PDFs
- Markdown content packages
- datasets
- software archives
- images
- long-form assets
- future preview resources

动态网站可以缓存 Walrus 内容和渲染结果，但必须保留 hash verify 能力。对于需要可信展示的内容，必须用链上 `content_hash` 校验下载内容。

### 3.3 Rust Reference Indexer

Rust indexer 是官方推荐的可复算索引管道。

它负责：

- 从部署 checkpoint 或首个 deployment event 开始 backfill。
- 实时 tail 新事件。
- 持久化 cursor。
- 存储 raw events。
- 去重。
- replay raw events 到 normalized tables。
- 使用 SDK 解析 PaperProof events 和 objects。
- 处理 canonical / verified / rejected / incomplete 状态。
- 维护 artifacts、versions、comments、governance、activity 等 normalized tables。
- 做 Walrus enrichment：download、hash verify、preview/cache metadata。
- 生成 analytics：counts、activity、leaderboard、airdrop inputs。
- 暴露 REST API 和 health check。
- 暴露 Prometheus metrics。

Rust indexer 的角色不是协议信任根。它是一个开源、可重放、可替换的查询加速层。

### 3.4 Dynamic Backend

Dynamic backend 是面向官网和应用的产品 API 层。

它可以：

- 读取 Rust indexer 的 REST API。
- 直接读取 Rust indexer 的 PostgreSQL 数据库。
- 做缓存。
- 聚合多个表。
- 管理官方 Docs / Blog / Forum manifests。
- 解包 Markdown content package。
- 生成安全 HTML preview。
- 提供搜索接口。
- 提供 feed、pagination、filter、sort。
- 保护上游 provider，减少前端直接打 RPC。

它不应该：

- 独立重新解释协议事实。
- 绕过 SDK / indexer 的 verified/canonical 判断。
- 把读取失败显示成“没有记录”。
- 替代钱包签名。
- 托管用户私钥。

### 3.5 Frontend

Frontend 继续承担用户交互：

- 钱包连接。
- 交易构建。
- 浏览器钱包签名。
- Publish。
- Add Version。
- Comment。
- Vote。
- Claim。
- 内容阅读和页面渲染。

Frontend 可以保留轻 indexer 能力，但定位应变为：

- fallback reads。
- current-page direct read。
- optimistic UI。
- post-transaction refresh。
- single-object verification。
- wallet-local data。

Frontend 不应再承担全站历史状态的主要构建责任。

## 4. 前端轻 Indexer 与 Rust Indexer 的关系

动态网站里应明确优先级：

```text
1. User transaction result / wallet-signed immediate action
2. Rust indexer verified API
3. Dynamic backend cached projection
4. Frontend direct SDK read for current object/page
5. Frontend event query fallback
```

解释：

- 用户刚签名完成的交易结果可以用于即时反馈。
- 全站列表、历史、搜索、统计应以 Rust indexer 为主。
- Backend cache 可以服务展示，但应知道自己的来源。
- 前端直读适合当前 artifact、当前 proposal、当前 wallet 的少量数据。
- 前端 event query fallback 只能用于临时补偿，不应作为统计、空投、治理历史的唯一来源。

## 5. 页面数据来源建议

### 5.1 Explore

优先读取 backend/indexer API。

需要接口：

- `GET /api/explore`
- `GET /api/types/:type/artifacts`
- `GET /api/artifacts/recent`

前端 fallback：

- 查询近期 canonical `ArtifactPublishedEvent`。
- 只作为临时显示，不作为完整历史。

### 5.2 Artifact Detail

优先读取：

- artifact series projection
- latest version
- version history
- comments tree projection
- likes summary
- Walrus preview cache

需要接口：

- `GET /api/artifacts/:artifactCode`
- `GET /api/artifacts/:seriesId/versions`
- `GET /api/artifacts/:seriesId/comments`
- `GET /api/artifacts/:seriesId/preview`

前端可以按需：

- 直接读当前 series object。
- 直接读当前 version object。
- 交易成功后 optimistic append comment。

### 5.3 Publish

交易仍由前端完成。

Backend 可以提供：

- content package upload helper。
- Walrus upload proxy 或 signed upload flow。
- package hash preview。
- content type suggestion。

但第一原则是：用户签名仍在浏览器钱包完成，backend 不代签。

### 5.4 Add Version

交易仍由前端完成。

Backend 可以提供：

- 读取上一版 Markdown package。
- 生成编辑初始内容。
- 校验新 package。
- 上传 Walrus。

合约层强制 Add Version 的 artifact type 与 series 原类型一致。前端应提前隐藏错误类型选项，SDK 应构建对应类型入口。

### 5.5 Governance

Governance 列表和历史优先使用 indexer。

需要接口：

- `GET /api/governance/active`
- `GET /api/governance/history`
- `GET /api/governance/proposals/:id`
- `GET /api/governance/votes?address=...`

前端可以在 proposal detail 页面按需调用 SDK verified read，尤其在投票或 claim 前。

### 5.6 My Space

My Space 应使用混合数据源。

Indexer/backend：

- published artifacts。
- voting records。
- comments。
- likes。
- user activity。

Frontend direct read：

- wallet address。
- wallet balances。
- transaction signing。

需要接口：

- `GET /api/users/:address/artifacts`
- `GET /api/users/:address/votes`
- `GET /api/users/:address/activity`

### 5.7 Docs

Docs 使用 official manifest + indexed artifact data。

Backend 可以：

- 读取 docs manifest。
- 根据 artifact code 查询 indexer。
- 下载并校验 Markdown content package。
- 缓存 rendered HTML。

需要接口：

- `GET /api/docs/nav`
- `GET /api/docs/pages/:slug`

### 5.8 Blog

Blog 使用 official manifest + indexed `blog_post` artifacts。

需要接口：

- `GET /api/blog/posts`
- `GET /api/blog/posts/:slug`

### 5.9 Forum

Forum 使用 indexed `generic_file` artifacts，其中 metadata 标记 `app_kind = "forum_topic"`。

需要接口：

- `GET /api/forum/categories`
- `GET /api/forum/topics?category=...`
- `GET /api/forum/topics/:id`
- `GET /api/forum/topics/:id/comments`

Forum topic 正文使用 Markdown content package；回复使用 comments tree plain text。

## 6. 数据库与表设计方向

Rust indexer normalized tables 应至少支持：

- `raw_events`
- `artifacts`
- `versions`
- `comments`
- `likes`
- `governance_proposals`
- `votes`
- `vote_claims`
- `activity`
- `walrus_objects`
- `content_packages`
- `search_documents`
- `analytics_daily`
- `airdrop_snapshot_rows`

Dynamic backend 可以增加自己的缓存表：

- `rendered_markdown_pages`
- `official_manifests`
- `api_cache_entries`
- `search_index_status`

所有缓存表都应可删除重建。

## 7. Markdown Package 服务

Dynamic backend 可以为 Markdown content package 提供更好的体验。

流程：

```text
artifact/version
  -> walrus blob id
  -> download package
  -> verify hash
  -> unpack
  -> read manifest.json
  -> render index.md
  -> sanitize
  -> cache HTML and assets map
```

安全要求：

- 禁用 raw HTML 或严格 sanitize。
- 不执行 JavaScript。
- 图片优先使用 package 内资源。
- 外链加安全属性。
- hash verify 失败时不生成可信 preview。

## 8. Search 与 Analytics

搜索不适合放在纯前端。

Dynamic backend / indexer 应提供：

- artifact code search。
- title search。
- author search。
- blog/docs/forum full-text search。
- type filter。
- date sort。
- activity sort。

Analytics 应支持：

- artifact count by type。
- version count。
- active authors。
- comments count。
- likes count。
- governance participation。
- Walrus content size。
- daily activity。
- airdrop eligibility inputs。

Analytics 输出应可复算，尤其是奖励、空投、积分相关数据。

## 9. API 设计原则

API 应该面向产品页面，而不是暴露数据库内部结构。

推荐原则：

- 返回分页 metadata。
- 区分 empty 与 failed。
- 返回 data freshness。
- 返回 source trust level。
- 返回 last indexed checkpoint。
- 返回 warnings。
- 对 incomplete data 明确标记。

示例响应：

```json
{
  "data": [],
  "page": {
    "limit": 20,
    "cursor": null,
    "has_next": false
  },
  "source": {
    "kind": "paperproof-indexer",
    "trust": "verified",
    "last_checkpoint": "123456789",
    "lag_checkpoints": 3
  },
  "warnings": []
}
```

前端不得把 API failure 显示为 “No records found”。

## 10. Deployment 与运维

推荐部署：

```text
paperproof-indexer
paperproof-api
postgres
redis or object cache
reverse proxy
prometheus
grafana
```

最低可行部署：

```text
single VPS
Docker Compose
PostgreSQL
Rust indexer
Node/Rust API backend
Nginx or Caddy
```

监控指标：

- indexed checkpoint。
- checkpoint lag。
- processed events。
- rejected events。
- incomplete events。
- DB write latency。
- Walrus download failures。
- hash verify failures。
- API latency。
- API error rate。
- provider retry count。

## 11. The Graph 与第三方 Indexer

The Graph 或其他第三方 indexer 可以成为 PaperProof 生态的数据入口，但短期不应假设它能完整替代 Rust reference indexer。

原因：

- PaperProof 需要 Sui 对象与事件的协议特定验证。
- 需要 deployment manifest 和 package/object binding。
- 需要 Walrus 内容下载与 hash verify。
- 需要 replay、airdrop snapshot、analytics、preview cache。
- 需要处理 canonical / verified / incomplete / rejected 状态。

更合理的策略：

- 官方维护 Rust reference indexer。
- 后续提供 The Graph / third-party adapter。
- 鼓励社区运行自己的 indexer。
- 让第三方应用选择适合自己的数据入口。

## 12. 渐进路线

### Phase 1: Static App

- 静态网站。
- TS SDK。
- 前端直接读链上少量数据。
- GitHub/Walrus manifest。
- 基础 Publish / Vote / Comment。

### Phase 2: Static App + Public Indexer API

- Rust reference indexer 独立部署。
- 静态前端优先读取 indexer API。
- 前端保留 fallback SDK reads。
- Explore、Governance、My Space 体验改善。

### Phase 3: Dynamic Backend

- Backend 包装 indexer API。
- 提供产品 API。
- Markdown package preview cache。
- Search。
- Blog / Docs / Forum manifest composition。

### Phase 4: Full Data Product

- Backend 直接读 indexer DB。
- Analytics。
- Airdrop snapshot。
- Ranking。
- Forum feed。
- Full-text search。
- 第三方 API。

## 13. 最终边界总结

- Sui 是状态事实源。
- Walrus 是内容事实源。
- Rust indexer 是可重放、可替换的历史同步和查询加速层。
- Dynamic backend 是产品 API、缓存、搜索和渲染层。
- Frontend 是钱包交互、展示、optimistic update 和局部 fallback 层。
- 前端轻 indexer 不应与 Rust indexer 争夺全站状态定义权。
- 所有奖励、治理历史、统计和可信 Explorer 状态应以 verified/canonical indexer 数据为基础。

这套架构让 PaperProof 可以从静态站自然演进到更强的协议应用，同时仍保持链上可验证、索引可复算、前端可替换、社区可自建入口的 Web3 属性。
