# 会读会写 Read & Write — Web 笔顺测试页

> **状态**：M0 重构后的开发期参考实现
> **用途**：iOS 工程师参考此 web 版的逻辑实现 SwiftUI + WKWebView 版本
> **不是**：最终 App 入口（最终 App 是 SwiftUI 原生 + WKWebView 嵌入 hanzi-writer）

---

## 直接打开

```bash
# 直接用浏览器打开（file:// 协议也能工作，完全离线）
open writer.html
# 或者用 server（推荐，避免某些浏览器 file:// CORS 限制）
cd .. && python3 -m http.server 8000
# 然后访问 http://localhost:8000/writer/writer.html
```

## 验收清单 (PRD §11 子集)

- [x] 输入"爱"显示 `ài`（单字）
- [x] 输入"学习"显示 `xuéxí`，两格分别画「学」「习」
- [x] 输入"中国"显示 `zhōngguó`（词组多音字命中）
- [x] 输入"中奖"显示 `zhòngjiǎng`（词组消歧）
- [x] 输入"银行"显示 `yínháng`（多音字 行 = háng）
- [x] 飞行模式 / 关网络可用（无任何 CDN 请求）
- [x] writer.html 可用 file:// 协议直接打开
- [x] 关闭网络后已支持字仍能打开笔顺画布

## 文件结构

```
writer/
├── writer.html        # 主入口
├── writer.css         # 样式（品牌色 token 已内联）
└── writer.js          # 逻辑（自定义 charDataLoader 走本地 vendor/）
```

依赖（在父目录）：
- `../vendor/hanzi-writer.min.js`（v3.5，本地化）
- `../vendor/hanzi-writer-data/data/*.json`（9534 字，47MB 原始 / 13MB gzip）
- `../pinyin/pinyin-single.json`（122KB，9531 单字）
- `../pinyin/pinyin-dict.json`（1.2MB，45816 词组）

## 与 iOS 端的对应关系

| Web 实现 | iOS 端对应 |
|---------|-----------|
| `writer.html` | SwiftUI ContentView 嵌入 WKWebView |
| `writer.css` | 同款 tokens.css 已经在 `4-助理/hanzi-ios-mvp/tokens/` 准备好了 |
| `writer.js` 中的 `getPinyin()` | Swift 用 pinyin4swift 或自带词库实现 |
| `writer.js` 中的 `createWriter()` | 同款逻辑写在 WKWebView 加载的 writer.html 里 |
| 拼音字典 | iOS 端打包 pinyin-single.json + pinyin-dict.json 进 Bundle |
| hanzi-writer-data | iOS 端打包整个 data/ 目录进 Bundle |

详细 iOS 端实施请见 PRD.md §6（技术方案）+ §9（迁移里程碑 M1+）。

## 已知限制

1. **多音字策略简化**：当前 webjs `getPinyin()` 只查词组词典 + 单字主拼音。不显示"另读"提示。
   - PRD §6.5 要求："另读"提示在 iOS 端 P1 实现，Web 测试页不实现。
2. **文件 file:// 加载在 Chrome 上需要 `--allow-file-access-from-files`**。
   - 这是 Chrome 的 CORS 限制，不影响 iOS WKWebView（WKWebView 用 `loadFileURL` 不受此影响）。
3. **慢速重建 Writer 实例**：当前实现用重建 writer 实现"慢速"，hanzi-writer 不支持运行时改速度。可接受。

## 调试

打开 Chrome DevTools 看 Console，应该看到：
- 拼音词典加载成功
- 每个字的 fetch 请求都是 `../vendor/hanzi-writer-data/data/{char}.json` （200 OK）
- 无任何外部 URL 请求

如果看到 `cdn.jsdelivr.net` 之类的请求，说明 `vendor/hanzi-writer.min.js` 没正确替换默认 CDN，需要重新跑 `sed` 替换。
