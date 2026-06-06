# Archive — 历史 v1 Web 原型（已废弃）

> **作废日期**：2026-06-06（进入 M0 后归档）
> **保留原因**：作为 PRD §2 当前实现测试结论的回溯依据 + 工作流原型参考
> **是否进入 iOS App**：❌ **不进入**

---

## 文件说明

| 文件 | 原作用 | iOS 替代 |
|------|--------|---------|
| `dashboard.html` | 与汉字学习主线无关的页面 | 完全废弃 |
| `hanzi.js` | CLI 生成笔顺动画 HTML 的 Node 工具 | Mac 端用 Swift / WKWebView 直接渲染，不再用 Node 生成 HTML |
| `index.js` | 老版本"硬编码笔画"实现，对"中国"只输出 `zhōng`，仅含 ~30 个常用字 | 完全废弃，被 hanzi-writer 替代 |
| `爱.html` / `学习.html` | hanzi.js 生成的产物（示例） | 不再生成静态 HTML |
| `package.json` / `package-lock.json` | Node 生态依赖（pinyin npm 包） | iOS 用 Swift pinyin 库或移植 pypinyin 词库 |

---

## 关键决策

1. **不再用 Node CLI 路线**：iOS App 是 SwiftUI + WKWebView 架构，不需要静态 HTML 生成器。
2. **不再用 `index.js` 的硬编码笔画数据**：完全切到 `hanzi-writer-data` 全量 6763 字方案。
3. **不再用 jsdelivr CDN**：所有 JS / 数据本地化到 `vendor/`，App 离线可运行。
4. **不再用 cnchar 输出拼音**：cnchar 浏览器侧输出首字母大写（`Ài`），与 CLI（`ài`）不一致；iOS 用 Swift 单一拼音源（详见 PRD §6 + BRAND-DECISION）。

---

## 回溯查询

如果需要查阅旧版本如何工作，可以：

```bash
git log --oneline -- archive/
git show HEAD~1:hanzi.js  # 等等
```

旧版本完整功能列表见 PRD §2「当前实现测试结论」。
