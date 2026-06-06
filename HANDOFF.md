# HANDOFF: 会读会写 Read & Write iOS App

> **From**: Linux 端 default agent  
> **To**: Mac 端 Claude Code  
> **日期**: 2026-06-06  
> **状态**: M0 完成，准备进入 M1（iOS 工程骨架）

---

## 你拿到了什么

这个仓库（`yishisanren/hanzi-tools`）现在是 **iOS App 的资源后台**。所有 web 端原型 + 资源都准备好了，你只需要在 Mac 上：

1. 新建 SwiftUI iOS 17+ 工程
2. 把这个仓库作为 git submodule 或者把 `vendor/` + `pinyin/` + `writer/` 三个目录拷进 Xcode 工程的 Resources
3. 按 spec 实现 SwiftUI 外壳 + WKWebView 桥接

## 必读三份文档（按顺序）

| # | 文档 | 路径 | 必读理由 |
|---|------|------|---------|
| 1 | **PRD v2** | `4-助理/hanzi-ios-mvp/PRD.md`（Obsidian）| 产品需求全貌 |
| 2 | **BRAND-DECISION** | 同上目录 `BRAND-DECISION.md` | 命名 + Logo + ASO 决策 |
| 3 | **本文** | 仓库根 `HANDOFF.md` | 仓库现状 + M1 入口 |

补充：
- **ASR-RESEARCH** (`4-助理/hanzi-ios-mvp/ASR-RESEARCH.md`)：语音识别选型，MVP 用 SFSpeechRecognizer 即可
- **COLOR-SYSTEM** (`4-助理/hanzi-ios-mvp/COLOR-SYSTEM.md`)：色板规范 + WCAG 验证
- **prototype/** (`4-助理/hanzi-ios-mvp/prototype/`)：高保真 HTML 原型，主页面 UI 直接参考

## 关键技术决策（不要重新讨论，已经定了）

1. **架构**: SwiftUI + WKWebView + 本地 JS bridge
   - SwiftUI: 导航、输入、语音、记录、设置
   - WKWebView: hanzi-writer 画笔顺画布
2. **拼音方案**: Swift 层单一拼音源
   - 备选 1: `pinyin4swift` (检查 License)
   - 备选 2: 移植 pypinyin 词库到 Swift（数据已经在 `pinyin/` 准备好了）
3. **完全离线**: 不依赖任何 CDN
4. **iOS 17+ only**
5. **存储**: UserDefaults (最近查询/设置) + SwiftData (收藏)

## 仓库目录现状

```
hanzi-tools/                    ← 本 git 仓库
├── HANDOFF.md                  ← 本文
├── README.md                   ← 历史 + 项目简介
├── CNAME                       ← GitHub Pages 用
├── archive/                    ← 历史 v1 Web 原型（不进入 iOS App）
│   ├── README.md               ← 解释为什么废弃
│   ├── dashboard.html          ← 旧仪表盘（无关）
│   ├── hanzi.js                ← 旧 CLI 生成器（Node + pinyin npm）
│   ├── index.js                ← 旧硬编码笔画数据（仅 30 字）
│   ├── 爱.html / 学习.html      ← 旧生成产物示例
│   ├── package.json            ← 旧 Node 依赖
│   └── package-lock.json
├── writer/                     ← M0 重构后的 Web 测试页（参考实现）
│   ├── README.md               ← 详细说明
│   ├── writer.html             ← 主入口
│   ├── writer.css              ← 样式（品牌色已内联）
│   └── writer.js               ← 逻辑（含 charDataLoader）
├── vendor/                     ← 本地化的第三方资源
│   ├── hanzi-writer.min.js     ← v3.5.0, 36KB, CDN 默认 URL 已替换为本地
│   └── hanzi-writer-data/      ← 字形数据 (9534 字 / 47MB / gzip 后 13MB)
│       └── data/*.json         ← 每字一个 JSON, ~1.5 KB/字
├── pinyin/                     ← 拼音字典（开发期参考）
│   ├── pinyin-single.json      ← 9531 单字 → 主拼音 (122KB)
│   └── pinyin-dict.json        ← 45816 词组 → 拼音串 (1.2MB)
└── index.html                  ← GitHub Pages 入口（旧版本暂保留）
```

## 你的 M1 任务（PRD §9 M1）

> M1: iOS 工程骨架

具体步骤：

```bash
# 1. 新建工程
mkdir ~/Code/HuiDuHuiXie && cd ~/Code/HuiDuHuiXie
xed -c . ToneStroke.xcodeproj   # 或者用 Xcode GUI 新建
```

工程配置：
- App Name: `会读会写` (中文) / `Read & Write` (英文)
- Bundle ID: 暂用 `com.yishisanren.huiduhuixie`（用户后续会告诉你正式 ID）
- Min iOS: 17.0
- Devices: iPhone + iPad
- Interface: SwiftUI
- Language: Swift
- Include Tests: 是

加入 AppIcon：
- 把 `4-助理/hanzi-ios-mvp/AppIcon.appiconset/` 直接拖进 Xcode 的 `Assets.xcassets/`
- 13 尺寸 + Contents.json 都准备好了

加入资源：
- 在 Xcode 工程下建 `Resources/`，把这个仓库的 `vendor/` + `pinyin/` + `writer/` 拷进去
- 选 "Create folder references" 而不是 "Create groups"，保持目录结构

加入色板：
- 从 `4-助理/hanzi-ios-mvp/tokens/Colors.swift` 复制进工程

写主入口 ContentView：
- 顶部 brand row (logo + "会读会写 Read & Write")
- 输入框 + 麦克风按钮（语音先 stub，M2 实现）
- 学习状态区（拼音 + 两格练习格）
- 底部最近练习 chip 滚动

写 WKWebView 包装：
- SwiftUI `UIViewRepresentable` 包 `WKWebView`
- 用 `loadFileURL(_:allowingReadAccessTo:)` 加载 Resources/writer/writer.html
- 暴露 JS bridge: `loadCharacters(chars)`, `animate()`, `startQuiz()`, `reset()`
- 接收 JS → Swift: `writerReady`, `quizMistake`, `quizCorrectStroke`, `quizComplete`, `loadError`

验收 (M1):
- App 启动能看到 brand bar + 输入框 + 一个空的学习状态区
- WKWebView 能加载本地 writer.html
- 输入"学"按查询，画布能画出"学"字笔顺
- 飞行模式下也能工作

## 你的 M2-M4 任务

- M2: 核心学习闭环（查询 + 动画 + 慢速 + 练习 + 反馈）
- M3: 本地记录（最近查询 + 收藏 + 设置 + About）
- M4: 上架准备（启动画面 + 隐私 + 无网络验证 + TestFlight）

每个里程碑的具体验收清单见 PRD §11。

## 你不需要做什么

❌ 不要重做 logo（已锁定，在 `4-助理/hanzi-ios-mvp/AppIcon.appiconset/`）
❌ 不要重做色板（已锁定，在 `4-助理/hanzi-ios-mvp/tokens/`）
❌ 不要重做拼音字典（已生成，在 `pinyin/`）
❌ 不要再讨论 App 名字（已锁定: 会读会写 Read & Write）
❌ 不要用任何 CDN 资源（所有依赖已本地化）
❌ 不要做 OCR / 字典 / 课程 / 账号 / 社区（不在 MVP 范围）

## 重要约束（PRD 强调过的）

- **完全离线可用**: 飞行模式下查询 + 笔顺动画 + 练习 全部可用
- **拼音多音字策略**: 单字默认最高频；词组按词典；未命中退化为逐字（详见 PRD §6.5）
- **License 合规**: `hanzi-writer-data` 基于 Arphic PL License，关于页**必须**展示 License 全文 + Make Me a Hanzi 致谢
- **Apple HIG**: 1024 AppIcon 已转 RGB（无 alpha 通道）。其他 12 尺寸保持 RGBA
- **Privacy Manifest**: 必须配置 `PrivacyInfo.xcprivacy`，声明无数据采集
- **出口合规**: Info.plist 加 `ITSAppUsesNonExemptEncryption = NO`

## 遇到问题怎么办

1. 看 PRD §10「风险与处理」
2. 看 `4-助理/hanzi-ios-mvp/ASR-RESEARCH.md`（语音相关）
3. 看 hanzi-writer 官方文档: https://chanind.github.io/hanzi-writer/
4. 在 Mac 端用 Hermes / 直接告诉用户

---

## Quick Start Verification (Mac 端)

```bash
# 验证仓库克隆完整
cd /path/to/hanzi-tools
ls vendor/hanzi-writer.min.js          # 36KB
ls vendor/hanzi-writer-data/data/ | wc -l   # 9534
ls pinyin/                              # pinyin-single.json + pinyin-dict.json

# 用浏览器先确认 web 版能跑（不依赖 Xcode）
open writer/writer.html
# 如果 Chrome 拒绝 file:// CORS, 起一个 server:
cd .. && python3 -m http.server 8000
# 然后访问 http://localhost:8000/hanzi-tools/writer/writer.html
```

Web 版能跑，说明 vendor/ + pinyin/ 完整，可以进 Xcode。

---

**祝顺利。如果遇到 spec 没覆盖的边界，记得用控制论原则：**
1. 系统建模：这是什么类型的问题？
2. 前馈：能不能在影响用户之前预防？
3. 反馈：测试结果回来怎么调控制变量？
4. 最优控制：约束内最高效的解法是什么？

— Linux 端 default agent
