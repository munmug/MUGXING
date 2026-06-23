# Xing / 星 — AI 金融研究工作台

## 1. 项目描述

Xing 是一个 AI-Native 金融研究工作台。用户通过中央输入框输入研究意图，系统识别意图后，自动进入合适的研究流程（快速分析 / 引导研究 / 研究工作室），并生成结构化结论、来源追踪和可编辑的研究工作流。

产品不做付费、不做策略商店、不做交易执行系统。所有功能默认直接可用。

## 2. 页面路由结构

所有页面通过前端状态 (`AppView`) 切换，不依赖路由：

```
AppView 状态机：
├── home                          — 首页中央星轴
├── intent-routing                — 意图识别中转（自动 1.5s 进入下一步）
├── quick-setup                   — 快速分析配置（3 步向导）
├── quick-result                  — 快速分析结果（主报告 + 指标卡）
├── guided-setup                  — 引导研究配置（框架 + 数据源选择）
├── research-running              — 研究执行中（3 列数据源 + 骨架进度）
├── conflict-review               — 冲突审查（原始/修正口径对比 + 3 种处理方式）
├── research-report               — 研究报告 + 右侧来源追踪
├── studio                        — 研究工作室画布（3 栏：模块/画布/Copilot）
├── studio-run-result             — 运行结果（结论 + 变量 + 风险 + 执行日志）
├── library                       — 研究资料库（表格 + 搜索 + 操作）
├── data-source-settings          — 数据源设置（开关 + 状态）
├── unknown-intent                — 无法识别意图兜底页
└── error                         — 数据源异常 / 分析失败状态
```

## 3. 核心功能清单

- [x] 中央星轴首页（Logo + 输入框 + 示例 + MarketPulse）
- [x] 意图识别路由（quick/guided/studio/unknown 自动分流）
- [x] 快速分析流程（配置 → 结果，含驱动因素/风险/指标卡片）
- [x] 引导研究流程（配置 → 执行中 → 冲突审查 → 报告 + TraceCanvas）
- [x] 来源追踪（5 节点可点击高亮报告对应段落）
- [x] 研究工作室（自动生成研究流 + 节点编辑 + Copilot 指令台 + 运行分析）
- [x] 研究资料库（搜索 + 查看/编辑/删除）
- [x] 数据源设置（开关 + 状态管理）
- [x] 异常与兜底状态（Unknown Intent / Error Page）
- [x] 通用组件系统（Toast、Modal、Stepper、ProgressBar、StatusBadge、SourceCard）
- [x] 所有按钮有反馈（Toast）
- [x] 视觉高级克制（纯黑 + #DEFF9A 霓虹绿 + 星点背景 + 网格画布）

## 4. 数据模型设计（纯前端 Mock）

本项目不需要数据库。所有数据通过 Mock 文件提供：
- `src/data/mockMarket.ts` — MarketPulse 数据
- `src/data/mockReports.ts` — QuickResult 和 Report 数据
- `src/data/mockSources.ts` — Library 和 DataSource 数据
- `src/data/mockStudio.ts` — Studio 节点和运行结果数据

## 5. 第三方集成计划

本阶段不需要任何后端集成。

## 6. 开发完成总结

### 项目结构

```
src/
├── App.tsx
├── main.tsx
├── index.css
├── lib/
│   ├── types.ts          — 类型系统（15 个 AppView + 所有数据接口）
│   ├── intentRouter.ts   — 意图识别路由（规则匹配 + 符号检测）
│   └── researchRunner.ts — 研究执行模拟（数据源 + 骨架 + 冲突数据）
├── data/
│   ├── mockMarket.ts     — 7 条市场脉搏数据
│   ├── mockReports.ts    — TSLA 快速分析 + 腾讯云报告 + Trace 节点
│   ├── mockSources.ts    — 7 个数据源设置 + 6 条资料库记录
│   └── mockStudio.ts     — 5 个研究流节点 + 运行结果
├── components/
│   ├── AppShell.tsx      — 核心状态机（15 个 View 切换）
│   ├── common/           — 通用组件（Toast, Modal, Stepper, ProgressBar, StatusBadge, SourceCard）
│   ├── home/             — 首页组件（StarAxisHome, IntentInput, MarketPulse）
│   ├── quick/            — 快速分析（QuickSetup, QuickResult）
│   ├── guided/           — 引导研究（GuidedSetup, ResearchRunning, ConflictReview, ResearchReport, TraceCanvas）
│   ├── studio/           — 研究工作室（StudioCanvas, ResearchNodeCard, NodeParameterPanel, StudioRunResult）
│   └── pages/            — 独立页面（Library, DataSourceSettings, UnknownIntent, ErrorPage, IntentRouting）
└── pages/
    └── home/page.tsx     — 入口页面（渲染 AppShell）
```

### 五条完整演示路径

1. **Quick Analysis**: 首页 → 输入 TSLA 风险在哪里 → 意图识别 → 快速分析配置 → 选择"风险在哪里" → 生成 → 快速分析结果
2. **Guided Research**: 首页 → 输入"拆解腾讯云增长逻辑" → 意图识别 → 配置框架/数据源 → 开始执行 → 研究执行中 → 冲突审查 → 保留两种观点 → 研究报告
3. **Report Trace**: 研究报告 → 右侧点击来源节点 → 报告段落高亮 → 查看来源详情
4. **Research Studio**: 研究报告 → 进入 Studio → 自动生成 5 节点研究流 → 点击节点编辑 → 保存 → 运行分析 → 运行结果
5. **兜底**: 首页 → 输入"帮我看看这个" → Unknown Intent → 选择引导研究 → 进入配置页