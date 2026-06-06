# 会读会写 Read & Write

> 汉字拼音 + 笔顺学习 iOS App 的资源仓库

## 当前状态

- **品牌**: 会读会写 / Read & Write（已锁定）
- **里程碑**: M0 完成（资源整理 + 本地化）→ 进入 M1（iOS 工程骨架）
- **目标平台**: iOS 17+

## 快速开始

### 浏览器看 web 版（参考实现）

```bash
# 直接打开
open writer/writer.html

# 或起本地 server（推荐）
python3 -m http.server 8000
# 访问 http://localhost:8000/writer/writer.html
```

### iOS 开发者（Mac 端）

**先读 [`HANDOFF.md`](HANDOFF.md)**，所有该知道的都在那里。

## 仓库结构

| 目录 | 内容 |
|------|------|
| `writer/` | M0 重构后的 Web 笔顺测试页（参考实现） |
| `vendor/` | hanzi-writer.min.js (3.5) + 9534 字字形数据（已本地化） |
| `pinyin/` | 拼音字典（9531 单字 + 45816 词组） |
| `archive/` | 历史 v1 Web 原型（已废弃，仅供回溯） |
| `index.html` | GitHub Pages 入口（跳转到 writer/） |

## 设计文档

详细 spec / PRD / 品牌决策 / 色板 / Logo 设计推理 全部在 Obsidian 笔记：

```
/Users/abc/Documents/obsidian/4-助理/hanzi-ios-mvp/
  ├── PRD.md                  # 产品需求 v2
  ├── BRAND-DECISION.md       # 命名 + Logo + ASO 决策
  ├── COLOR-SYSTEM.md         # 色板规范
  ├── ASR-RESEARCH.md         # 语音识别选型
  ├── AppIcon.appiconset/     # 13 尺寸 iOS AppIcon
  ├── tokens/                 # tokens.css + Colors.swift
  └── prototype/              # 高保真 HTML 原型
```

## 致谢

- [hanzi-writer](https://chanind.github.io/hanzi-writer/) - 笔顺动画引擎
- [hanzi-writer-data](https://github.com/chanind/hanzi-writer-data) - 字形数据（基于 [Make Me a Hanzi](https://www.skishore.me/makemeahanzi/)，Arphic PL License）
- [pypinyin](https://github.com/mozillazg/python-pinyin) - 拼音词典数据源

## License

App 本身待定。第三方资源 License：
- hanzi-writer: MIT
- hanzi-writer-data / Make Me a Hanzi: GPLv3 + Arphic PL（需在 App 关于页展示）
- pypinyin: MIT
