# dsh-tool-app-verify

> 兼容 dsh 0.2.1-rc.x（@deepseek-ai/cordis ~4.0.5、@deepseek-ai/dsh-tools ~0.2.1-rc.2）。v0.1.1 起 content block 为扁平结构、工具结果为 role:'tool' 消息。

DSH 插件：Browser & Electron UI 操作与验证——让 Agent 像 QA 一样驱动应用并断言行为。

## 功能

**Action 工具**（操作应用）：
- `app_launch` — 启动浏览器或 Electron 应用
- `app_click` — 点击元素
- `app_type` — 输入文本
- `app_navigate` — 导航（goto/back/forward/reload）
- `app_close` — 关闭会话

**Assert 工具**（验证行为）：
- `app_verify` — 断言元素状态（存在/可见/文本/属性）
- `app_screenshot` — 截图（可保存为基线）
- `app_screenshot_diff` — 视觉回归：对比当前截图与基线，返回差异百分比和高亮图
- `app_accessibility` — 获取 accessibility tree 快照

## 安装

```bash
dsh plugin add dsh-tool-app-verify
```

## 配置

```yaml
- id: app-verify
  plugin: dsh-tool-app-verify
  config:
    mode: browser           # browser | electron
    headless: true
    timeout: 30000
    baselinePath: .app-verify/baselines
    diffThreshold: 0.1      # pixelmatch 容差
    viewport:
      width: 1280
      height: 720
```

## 使用示例

### Browser 模式

```
User: 打开我们的登录页，验证登录按钮存在且可点击

Agent:
→ app_launch({ target: "http://localhost:3000/login" })
→ app_verify({ selector: "role:button[name=\"登录\"]", assertion: "visible" })
→ app_screenshot({ saveAs: "login-page" })
✓ 登录按钮存在且可见，已保存截图基线。
```

### Electron 模式

```
User: 启动我们的桌面应用，检查主窗口标题

Agent:
→ app_launch({ target: "./dist/main.js", mode: "electron" })
→ app_verify({ selector: "role:heading", assertion: "text_contains", expected: "Dashboard" })
✓ 主窗口标题包含 "Dashboard"。
```

### 视觉回归测试

```
User: 对比当前首页和上次的基线截图

Agent:
→ app_launch({ target: "http://localhost:3000" })
→ app_screenshot_diff({ baseline: "homepage" })
结果：匹配度 97.3%，有差异区域已高亮显示。
```

## 选择器格式

| 格式 | 示例 | 说明 |
|------|------|------|
| `role:` | `role:button[name="Submit"]` | Playwright role locator |
| `text:` | `text:Hello World` | 文本匹配 |
| `testid:` | `testid:login-btn` | data-testid 属性 |
| `//` | `//div[@class="main"]` | XPath |
| 其他 | `#id` / `.class` / `div > span` | CSS 选择器 |

## 与 dsh-session-analyst 配合

1. Agent 用本插件执行 UI 测试流程
2. 测试完成后用 `analyze_session` 审计会话效率
3. 用 `compare_sessions` 对比不同版本的测试表现

## 开发

```bash
npm install
npm test          # 运行单元测试（选择器解析、图片对比）
npx playwright install chromium  # 首次需安装浏览器
```

## License

MIT
