Copyright (c) 2026 PaperProof Labs. All rights reserved.
SPDX-License-Identifier: LicenseRef-PaperProof-Interface-Source-Available

# PaperProof Copilot 与 MemWal 私有记忆集成设计

本文记录 PaperProof 官方网站后续将 Copilot 用户私有记忆功能接入 MemWal 的设计思路。本文聚焦产品边界、身份模型、数据流、记忆策略和 MVP 范围，用于后续实现规划，也可作为对外展示 PaperProof 生态长期能力的一部分。

核心目标不是把全部聊天记录原样同步到链上或 Walrus，而是让用户在 PaperProof 站内与 Copilot 交互过程中形成的长期偏好、持续兴趣和私有研究上下文，成为可选、私有、可恢复、可跨设备延续的个人记忆层。

## 1. 设计目标

PaperProof 官方网站后续的 Copilot 功能，希望具备以下能力：

- 在用户再次访问时自动恢复其长期偏好；
- 在用户更换设备或浏览器后保持连续性；
- 使用钱包地址作为统一身份，而不是浏览器本地缓存或中心化账号；
- 将公开知识与私有记忆区分开；
- 让该能力可选，用户可以不启用；
- 在不破坏当前网站静态站点定位的前提下，为未来动态站点和 agent 生态预留接口。

需要强调的是，Copilot 私有记忆不等于公开知识资产。用户偏好、私人兴趣、私人研究笔记与工作上下文，适合进私有记忆层；正式的文章、报告、官方 Prompt 规范、知识包和可引用文档，则更适合进入 PaperProof 协议层。

## 2. PaperProof 与 MemWal 的角色分工

推荐分工如下：

- PaperProof：公开、可发布、可版本化、可引用、可评论、可治理的知识与工件协议层。
- MemWal：私有、持续、可恢复、可跨设备读取的用户个人记忆层。
- Copilot：同时消费 PaperProof 公共知识与 MemWal 私有记忆的智能体入口。

推荐对外表达：

> PaperProof stores public knowledge artifacts and protocol-native history. MemWal can provide optional private memory continuity for the user's Copilot experience, keyed by the user's wallet identity.

这意味着：

- 官方文档、已发布 artifact、官方 Prompt 规范、公开知识包，应放在 PaperProof。
- 用户偏好、语言习惯、持续关注主题、私人研究上下文、尚未发布的长期私人记忆，适合放在 MemWal。

## 3. 用户身份模型

推荐以 Sui 钱包地址作为 Copilot 私有记忆的统一用户身份。

理由如下：

1. 与 PaperProof 协议和网站本身的 Web3 身份模型一致。
2. 可跨浏览器、跨设备延续。
3. 便于用户把长期记忆与某个中心化账号解耦。
4. 与 MemWal 的 onchain owner + account 模型天然兼容。

用户首次启用该功能时，系统可以：

1. 检测当前连接的钱包地址；
2. 检查该地址是否已拥有 MemWalAccount；
3. 如果没有，则引导创建；
4. 创建完成后，将该钱包地址视作该用户在 Copilot 私有记忆层中的统一身份。

## 4. 功能定位

该功能建议命名为：

- `Personal Copilot Memory`
- 或 `Private Copilot Memory`

推荐定义：

> A wallet-linked optional memory layer for restoring personal Copilot preferences, interests, and durable private context across sessions and devices.

它不是聊天记录同步器，也不是站内行为全量审计系统。它的目标是存储经过筛选后的长期有价值记忆。

## 5. 适合写入 MemWal 的信息类型

推荐优先支持以下类型：

### 5.1 用户偏好

- 偏好语言，例如用户总是要求用中文回答；
- 偏好回答风格，例如简洁、详细、偏工程、偏学术；
- 偏好内容组织方式，例如更喜欢列表、表格、结论先行。

### 5.2 长期兴趣

- 用户持续关注的协议模块；
- 用户经常浏览或提及的 artifact 类型；
- 用户长期研究的主题，例如 formal verification、governance、agent memory、preprint workflow。

### 5.3 私人研究上下文

- 用户围绕某个 topic 的长期关注点；
- 用户在站内与 Copilot 对话中形成的私人研究方向摘要；
- 用户确认希望长期保留的私人理解与提醒。

### 5.4 站内长期使用偏好

- 偏好的 Docs 样式；
- 是否更常请求技术解释；
- 是否更常请求中文总结；
- 是否常要求对比分析。

## 6. 不建议直接写入 MemWal 的信息

为避免记忆污染和过度存储，以下内容不建议直接写入：

- 每轮完整对话原文；
- 原始页面点击流；
- 一次性问题；
- 未经筛选的中间推理；
- 公开页面内容的简单重复副本；
- 明显应该发布为 PaperProof artifact 的正式内容。

原则是：写入 MemWal 的应该是 durable memory，而不是 raw transcript。

## 7. Namespace 设计

第一版建议使用少量但清晰的 namespace。

### 7.1 `copilot/profile`

用于存储稳定用户偏好：

- `preferred_language`
- `response_style`
- `preferred_explanation_density`
- `preferred_output_format`

### 7.2 `copilot/interest`

用于存储用户在 PaperProof 生态中的长期兴趣：

- 常关注 topic；
- 常关注 artifact 类型；
- 最近一段时间的研究焦点。

### 7.3 可选扩展：`copilot/topic/<topic>`

未来如需更细粒度隔离，可以把长期研究上下文拆分为：

- `copilot/topic/governance`
- `copilot/topic/formal-verification`
- `copilot/topic/preprint`

第一版不必实现该扩展，但应在设计上预留。

## 8. 启用方式与用户体验

该功能应为可选功能。

### 8.1 初次启用

当用户连接钱包并首次打开 Copilot 时：

1. 检查是否已有 MemWalAccount；
2. 若已有，则可提示：
   - `Enable Personal Copilot Memory`
3. 若没有，则提示：
   - `Create a private memory account for Copilot continuity`

### 8.2 自动加载

如果用户：

- 已有 MemWalAccount；
- 且此前已启用该功能；

则下次连接同一钱包地址时，Copilot 自动：

1. 读取 `copilot/profile`；
2. 读取 `copilot/interest`；
3. 将结果加载到 Copilot 的私有记忆上下文中。

推荐对用户保持温和透明，例如显示：

- `Personal memory loaded from your wallet-linked MemWal account`

### 8.3 关闭与清理

用户应可以：

- 关闭该功能；
- 清空 Copilot profile memory；
- 仅关闭自动加载，但保留记忆；
- 清理某个 topic namespace。

## 9. Copilot 读取流程

Copilot 处理用户问题时，推荐按以下顺序组织上下文：

1. 当前用户明确输入；
2. 当前页面上下文；
3. PaperProof 公共知识；
4. MemWal 私有记忆。

这意味着用户当前请求始终优先于历史记忆。

### 9.1 当前页面上下文

例如：

- 当前 artifact 详情；
- 当前 docs 页面；
- 当前 governance 页面；
- 当前搜索结果页面。

### 9.2 PaperProof 公共知识

例如：

- 当前 artifact metadata；
- 当前 artifact 正文；
- 相关版本信息；
- 相关评论；
- 官方 docs；
- 官方知识包；
- 官方 Prompt 规范。

### 9.3 MemWal 私有记忆

例如：

- 用户偏好的语言；
- 用户偏好的解释风格；
- 用户最近持续关注的主题；
- 用户先前在该主题上的私人研究上下文。

## 10. Copilot 写入流程

### 10.1 写入原则

不要默认把所有对话都写入 MemWal。推荐使用受控写入。

### 10.2 推荐写入触发方式

#### 显式触发

当用户明确表达：

- `记住这个`
- `以后都用中文回答`
- `保存这个偏好`
- `把这个加入我的 Copilot 记忆`

此类请求可以直接抽取并写入。

#### 自动抽取触发

在单轮会话或会话结束后，可以使用一个轻量抽取步骤：

- 提取最多 1 到 3 条长期有价值记忆；
- 过滤一次性问题；
- 不保存未经确认的敏感推测；
- 按 namespace 分类。

#### 半自动确认

对于较强的个人化内容，可以让用户确认：

- `Copilot noticed that you prefer Chinese responses. Save this preference?`

第一版可先不做复杂确认 UI，但应在设计上预留。

## 11. 记忆抽取策略

推荐的抽取策略不是全文保存，而是结构化摘要。

例如，从对话中抽取：

- `preferred_language = zh-CN`
- `response_style = concise_technical`
- `interest_topics = [governance, memwal, formal_verification]`
- `recent_focus = comparing private memory infrastructure for AI agents`

这类结构化、可压缩、低噪音的记忆更适合长期保留。

## 12. 实时指令与历史记忆的优先级

必须明确以下优先级：

1. 当前用户明确指令；
2. 当前页面上下文；
3. MemWal 历史记忆。

例如：

- 用户过去偏好中文；
- 但本次明确说请用英文回答；

则当前回合必须遵从英文要求，而不是被历史偏好锁死。

## 13. 与 PaperProof 协议层的关系

除了应用层直接接入 MemWal 之外，PaperProof 协议层还可以提供两个轻量支持：

1. 统一入口与能力注册，用于让网站、SDK 和第三方应用感知用户是否启用了私有记忆能力；
2. 记忆类别与写入规范，用于给 Copilot、网站脚本和第三方 agent 提供统一的写入参考和解析依据。

这两个支持都应保持轻量、弱耦合、可替换。也就是说，协议层适合做发现、声明、分类和规范，不适合直接承载 MemWal 私有记忆正文或接管私有记忆系统本身。

### 13.1 协议层统一入口与能力注册

建议未来在 PaperProof 协议层增加一个轻量入口，用于绑定钱包身份与私有记忆能力，而不是直接上链存储记忆内容本体。

协议层可负责的内容包括：

- 用户是否声明启用了某个私有记忆 provider；
- 该 provider 的类型或标识；
- 默认 memory profile pointer 或 account pointer；
- 与 PaperProof 身份绑定的公开能力声明；
- 相关事件，供 indexer、前端和第三方服务发现。

协议层不应负责的内容包括：

- 私有记忆正文；
- 私有检索排序；
- prompt 注入；
- 私有内容权限控制细节；
- 记忆摘要、冲突合并、加密实现。

推荐把该能力理解为：

> PaperProof protocol provides discovery, identity binding, and capability advertisement for private Copilot memory, while MemWal or another provider stores the private memory body.

这样的协议层统一入口，可以让官方站、第三方站点、移动端和未来的 agent 工具链，都先从 PaperProof 得知：

- 该钱包地址是否启用了个人 Copilot 记忆；
- 启用的是哪一种 provider；
- 默认应该去哪里读取；
- 当前站点是否可以据此自动恢复记忆。

这类入口未来可以体现在一个轻量模块中，例如：

- `memory_registry`
- 或 `user_capabilities`

如果未来该能力明显超出 PaperProof 自身范围，再考虑拆成独立 package；当前阶段更适合作为主协议中的轻量扩展。

### 13.2 协议层定义记忆类别与写入规范

除了注册入口之外，协议层还可以定义一套官方的记忆类别规范，用于约束 Copilot 往 MemWal 写入的记忆类型和元数据结构。

这里的“约束”不是去校验私有正文内容本身，而是去定义：

- 哪些类别的记忆适合长期保存；
- 哪些类别可以自动写入；
- 哪些类别更适合要求用户确认；
- 每一类记忆建议携带哪些 metadata；
- 这些记忆在网站和 SDK 中应如何被解释与消费。

这样做有两个直接好处：

1. 给 Copilot 实际存储记忆时提供统一参考，避免不同实现各写各的；
2. 让网站脚本、SDK 和第三方应用读取记忆时，能按明确类型做解析与服务增强。

协议层可定义一组官方类别，例如：

- `pp:language_preference`
- `pp:response_style`
- `pp:interest_profile`
- `pp:reading_history_summary`
- `pp:research_context`
- `pp:task_continuity`
- `pp:site_preference`
- `pp:copilot_saved_note`

同时允许第三方扩展类别，例如：

- `ext:<namespace>:workflow_state`
- `ext:<namespace>:agent_context`

推荐每条记忆在 provider 侧存储时，除正文外还带上统一 metadata，例如：

- `category`
- `schema_version`
- `producer`
- `created_at`
- `updated_at`
- `retention`
- `sensitivity`
- `page_context`
- `wallet_scope`

其中：

- `category` 用于表示记忆类型；
- `schema_version` 用于保证后续升级可控；
- `producer` 用于标识是谁写入了该条记忆；
- `retention` 可区分 short / long / manual；
- `sensitivity` 可区分 low / private / high；
- `page_context` 可标记该记忆来自 docs、artifact detail、governance 或 explore 等页面。

这样网站或 SDK 就可以实现更智能的消费逻辑，例如：

- 只自动加载 `pp:language_preference`；
- 对 `pp:research_context` 用于恢复长期主题；
- 对高敏感度记忆默认不自动注入 Copilot prompt；
- 对 `pp:reading_history_summary` 用于个性化推荐；
- 对 `pp:task_continuity` 用于恢复上次中断的工作流。

协议层在这里扮演的是公开 schema 维护者，而不是私有记忆正文的管理者。它更像是：

> PaperProof Copilot Memory Schema: a public protocol-level taxonomy and semantics layer for private memory providers such as MemWal.

### 13.3 协议层与应用层的边界

推荐边界如下：

- 协议层：定义入口、分类、语义、公开事件、版本规则；
- SDK：封装读写该入口、暴露类型定义、帮助应用按 schema 消费；
- 官方网站：决定哪些页面启用自动加载、何时提示用户保存记忆、如何将页面上下文与记忆结合；
- MemWal：负责私有内容的实际存储、权限、加密和恢复；
- 第三方 agent：可以遵循官方 schema，也可以在扩展前缀下自定义类别。

因此，PaperProof 协议层适合帮助应用“知道去哪里找记忆，以及这类记忆该如何理解”，而不是自己变成一个私有记忆系统。

### 13.4 适合放 MemWal 的

- 私人偏好；
- 私人上下文；
- 个人研究摘要；
- 私有笔记；
- 还未发布的中间记忆。

### 13.5 适合放 PaperProof 的

- 官方 Prompt 规范；
- 公开知识包；
- 官方 docs；
- 公开 blog / report / preprint；
- 可评论、可版本化、可引用的内容。

可将二者关系表述为：

> MemWal supports private Copilot continuity. PaperProof remains the public protocol layer for durable, citable, and versioned knowledge artifacts.

## 14. MVP 范围建议

黑客松或早期产品阶段，建议只做最小可验证版本。

### 第一版支持的记忆字段

- `preferred_language`
- `response_style`
- `top_interests`
- `recent_research_focus`

### 第一版支持的页面

- Docs Copilot
- Artifact Detail Copilot

### 第一版支持的能力

- 钱包连接后自动检查是否有 MemWalAccount；
- 用户可选启用 Personal Copilot Memory；
- 自动加载 `copilot/profile` 和 `copilot/interest`；
- 支持显式 `remember this`；
- 支持会话后小规模偏好抽取。

### 第一版暂不必实现

- 全量聊天记录存储；
- 复杂 topic namespace 管理 UI；
- 多模型多智能体同步；
- 复杂记忆冲突合并；
- 高级治理或公开分享记忆。

## 15. 安全与信任边界

如果接入 MemWal 默认 relayer 模式，需要明确：

- 默认模式下，relayer 可能在加密前看到 plaintext；
- 若未来要求更强私有性，可逐步转向更偏手动、客户端加密的模式；
- 但第一版可优先验证用户连续性价值，而不是一开始就追求最强隐私路径。

建议在设计说明中明确：

- Personal Copilot Memory is optional.
- Memory loading is wallet-linked.
- Public knowledge and private memory are handled separately.

## 16. 对外价值表达

该设计对于黑客松评审和生态叙事的价值在于：

1. 展示 PaperProof 不只是内容发布协议，也可承接 AI 原生体验；
2. 将钱包身份、公开知识协议、私有长期记忆三者结合；
3. 提供区别于传统 Web2 Copilot 的跨设备、跨环境连续性设想；
4. 与 Sui / Walrus / MemWal / SEAL 生态能力形成深层协同。

推荐对外表达：

> PaperProof can evolve from a public knowledge protocol into an AI-native knowledge environment. Public artifacts live on PaperProof, while optional wallet-linked private Copilot memory can be restored through MemWal.

## 17. 总结

PaperProof 网站的 Copilot 私有记忆功能，推荐以钱包地址作为统一身份、以 MemWal 作为可选私有长期记忆层、以 PaperProof 作为公开知识层。Copilot 在回答时同时读取公开知识与私有记忆，在写入时只保留经过筛选的长期偏好与持续兴趣，而不是原样保存全部聊天记录。

该设计既保留了 PaperProof 协议的公开、可引用、可版本化特征，又为未来 AI agent 体验提供了可迁移、可恢复、可个性化的私有连续性基础设施。
