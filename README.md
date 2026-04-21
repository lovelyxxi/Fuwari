# Handoff: 屏幕使用时间 · 云云 (Screen Time "CloudCloud")

> Windows 桌面端屏幕使用时间监控应用 — 手绘涂鸦风格，带云朵吉祥物和桌面悬浮窗。

---

## Overview

这是一款 Windows 桌面端的屏幕使用时间监控软件，记录用户的前台应用使用情况，并在主窗口关闭/最小化时通过一个常驻桌面的**悬浮小云朵**继续提供实时反馈。核心卖点：

- **温柔陪伴感**：吉祥物"云云"根据使用时长切换表情（开心 / 平静 / 犯困 / 担心 / 警觉）
- **手绘涂鸦风**：不规则圆角、手写体装饰、纸张质感 — 降低监控工具的冰冷感
- **悬浮窗常驻**：即使主窗口最小化，桌面也有一个可拖拽、可展开的小云朵 widget

## About the Design Files

本目录下的 HTML / JSX / CSS 文件是**高保真设计原型**（hi-fi mockups），不是生产代码。它们用 React + Babel in-browser 实现，仅用于展示视觉、交互和状态机。

你的任务是：**用目标代码库的技术栈重新实现这些设计**。如果是 Electron / Tauri / WPF / WinUI，请使用其组件库与样式系统，而不是直接复制这里的 JSX。

如果项目还没有技术栈，推荐：
- **Electron + React + TypeScript**（跨平台潜力、生态成熟）
- **Tauri + React/Vue**（更轻量，二进制更小）
- **WinUI 3 + C#**（原生 Windows 体验最佳）

## Fidelity

**High-fidelity (hi-fi)**。所有颜色、字体、间距、圆角值都是最终值，应按像素实现。只有手绘图形（云朵、番茄、星星等 SVG path）可以接受轻微再绘制，但需保留"手绘不规则感"。

---

## Screens / Views

共有 **2 个应用级表面** + **6 个主窗口 Tab** + **4 个悬浮窗状态**：

### 表面 1：主窗口 (MainWindow)

**尺寸**: 默认 960 × 620（可调整大小，最小 840 × 560）
**外观**: 模拟 Windows 11 窗口，但带手绘风格
- 外边框：`2px solid #2A2A3C`，圆角 `14px 16px 14px 16px`（轻微不规则）
- 外阴影：`6px 6px 0 #2A2A3C, 0 20px 60px rgba(42,42,60,0.15)`

**标题栏** (高 36px):
- 左：云云吉祥物图标 (26×26) + "屏幕使用时间 · 云云" (13px / 700) + 手写体副标题 "— 陪你看时间慢慢走" (Caveat / 11px / #9A9AB0)
- 右：最小化 / 最大化 / 关闭 按钮（46×36，左分隔线 `1.5px solid #2A2A3C`）
  - hover 背景：最小/最大化用 `#ECE6D6`，关闭用 `#FFCFB8`
- 底部分隔：`2px solid #2A2A3C`

**左侧导航** (宽 88px):
- 背景 `#ECE6D6`，右分隔 `2px solid #2A2A3C`
- 6 个按钮，图标字符 + 文字双行
  1. `☁ 今日`
  2. `★ 排行榜`
  3. `∿ 时间线`
  4. `▦ 周月`
  5. `🍅 专注`
  6. `⚙ 设置`
- 选中态：白底 + `2px solid #2A2A3C` + `2px 2px 0 #2A2A3C` 阴影，圆角 `12px 14px 12px 14px`
- 未选中：透明背景，hover 时无变化
- 底部：吉祥物 42px + 手写体 "v1.0"，上方虚线分隔

**内容区**: 滚动隐藏滚动条 (`scrollbar-width: none`)

### 主窗口 Tab 详解

#### Tab 1 — 今日总览 (TabToday)
- **Header 行**: 云云 80px (mood=happy) + 手写体问候 "下午好呀 ~" (Caveat / 32px) + 副文字 + 右侧日期
- **大数字卡**（左，占 1.3fr）:
  - 标签 "今日总使用" (12px / 700 / #5A5A72)
  - 大数字：手写体 64px 小时 + 48px 分钟，基线对齐
  - chip "↓ 比昨天少 23 分"（薄荷绿）+ 鼓励文案
  - 分类水平堆叠条（高 14px，4 色分段：mint / blue / lilac / peach）
- **饼图卡**（右，占 1fr）:
  - 手绘风饼图 170px（4 段 SVG path，每段 `stroke-width: 2`）
  - 中心白圆 r=18，显示总小时数（手写体 16px）
  - 右上角旋转 6° 的手写体标签 "✦ 专注日"
- **今日时间线 mini**: 24 小根柱状，当前小时（index=15）高亮为 lilac 并在顶部显示 "现在" 标签
- **Top 3 应用卡**: 3 列网格，每卡显示图标 / 名称 / 分类 / 时长 / TOP 徽章。第 1 名右上角有旋转 15° 的小星星

#### Tab 2 — 应用排行榜 (TabApps)
- 顶部：手写体大标题 + 分类 tab 按钮组（全部 / 工作 / 沟通 / 浏览 / 娱乐）
- 列表：每行 = 排名（手写体 28px） + 44px 应用图标 + 名称 + 分类 chip + 水平进度条 + 时长 + `⏱ 限额` 按钮

#### Tab 3 — 时间线 (TabTimeline)
- 手写体大标题 "今天的时光小径"
- 大柱状图 200px 高，每根柱带手绘风格圆角顶 `5px 7px 1px 1px`
- 虚线参考线（25% / 50% / 75%）
- 当前小时柱子上方浮出 `⬇ 现在 · [AppName]` 标签
- 底部：3 张"高光瞬间"卡（最专注时段 / 最长小憩 / 切换应用次数）

#### Tab 4 — 周月统计 (TabStats)
- 周切换 tab（周 / 月 / 年）
- 7 根日柱状图 (200px 高)，今天 lilac，其余 mint
- 右侧 3 张统计小卡（总时长 / 最高一天 / 专注番茄）—— 分别 blue / lilac / peach 背景
- 底部鼓励条（薄荷绿底）带云云 + 文案

#### Tab 5 — 专注番茄 (TabFocus)
- 左：大番茄 230px SVG（peach 底 + mint 叶子 + 进度 dash 环）+ 大数字计时 `25:00` (Nunito 800 / 54px) + 开始/重置按钮
- 右：3 张卡
  - "今天的番茄 5 / 8"（8 个小番茄 SVG）
  - 本轮任务（虚线下划线输入框）
  - 专注选项（柠檬色卡，3 个 checkbox：屏蔽娱乐/隐藏通知/白噪音）

#### Tab 6 — 设置 (TabSettings)
- 2 列网格的设置卡（每卡：标题 + 描述 + 右侧 toggle）
- 6 项：开机自启 / 悬浮窗 / 空闲检测 / 隐私空白 / 久坐提醒 / 每日小结
- 底部隐私声明卡（云云 mood=calm）+ 导出 / 清空 按钮

---

### 表面 2：桌面悬浮窗 (FloatingWidget)

**三种形态变体**（用户可在设置中选择）：

#### 变体 A：小云朵头像 Pill（默认 · 推荐）
- 72×72 圆形白底 + `2.5px solid #2A2A3C` 边框
- 内置 56px 云云
- 右下角徽章：lilac 背景圆角矩形，显示今日总时长 `8h44`
- 左上角在 hover 时显示 peach 小圆 `⋮⋮`（拖动提示）
- 阴影：`3px 4px 0 #2A2A3C, 0 6px 20px rgba(42,42,60,0.18)`

#### 变体 B：胶囊条
- 宽度自适应，圆角 36px
- 左侧 40px 圆形云云 + 右侧两行文字（正在·应用名 / 时长 · 今日总时长）

#### 变体 C：站立果冻
- 120px 果冻吉祥物（JellyMascot）直接贴桌面，底部有投影
- 右上头顶气泡显示当前应用+时长

### 悬浮窗的 4 种状态（所有变体通用）

1. **pill** — 收起默认态
2. **tooltip** — 鼠标悬停 500ms 后显示深色小提示（200px 宽，显示当前应用 + 本次/今日时长 + 双击提示）
3. **card** — 点击展开的卡片（256px 宽），包含：
   - 当前应用 + 云云表情
   - 分隔 hr-wavy（波浪手绘线）
   - 今日总计大数字
   - 分类条
   - 3 按钮行（🍅 专注 / ⤢ 打开 / ⏸）
   - 底部 lemon 色小贴士 "💧 记得歇歇眼睛哦"
4. **menu** — 右键菜单（220px 宽），8 项：暂停记录 / 开始专注 / 打开主窗口 / [分] / 吸附边缘 / 仅图标模式 / [分] / 设置 / 退出

**关键行为**：所有 popover（tooltip / card / menu）**必须向上弹出**（`bottom: calc(100% + 12px)`），因为 widget 默认位于屏幕右下角，这也符合 Windows 系统托盘惯例。小三角尾巴指向下方的 widget。

---

## Interactions & Behavior

### 悬浮窗交互
- **拖拽**：鼠标按下 widget 主体可自由拖拽到屏幕任意位置；记录位置到本地配置
- **吸附边缘**：拖到屏幕边 20px 内自动吸附；仅露出一半 pill，鼠标靠近时再浮出
- **单击**：切换 pill ↔ card 状态
- **双击**：恢复/打开主窗口（若已最小化则还原）
- **右键**：显示 context menu
- **悬停 500ms**：显示 tooltip
- **外部点击**：关闭 card / tooltip / menu

### 云云情绪切换规则
```
  今日总时长 < 2h  → happy
  2h ≤ 总时长 < 5h → happy
  5h ≤ 总时长 < 8h → calm
  总时长 ≥ 8h      → worried
  22:00 后仍在用   → sleepy
  单个应用超限额  → alert
  专注模式进行中  → calm (覆盖其他)
```

### 动画
- 云云身体 `animate-wobble` — 3s 无限轻摇 ±1.5deg
- 眼睛 `animate-blink` — 4s 无限，95%-100% 时 scaleY(0.1)
- 悬浮 pill 进入：弹性缩放 `cubic-bezier(0.34, 1.56, 0.64, 1)` 240ms
- Card 展开：transform-origin 底部左侧，scale(0.9→1) + opacity(0→1) 180ms
- Tab 切换：内容区 opacity fade 120ms

### 久坐提醒
每 45 分钟（可配置）弹出 toast：云云头像 + "站起来动一动吧～" + `知道啦` 按钮。从屏幕右下滑入，5 秒后自动消失。

---

## State Management

```ts
interface AppState {
  // 实时前台应用（每秒更新）
  currentApp: { name: string; exePath: string; iconPath: string; mins: number };

  // 今日数据
  today: {
    totalMins: number;
    byApp: Map<string, { mins: number; category: string }>;
    byCategory: Record<Category, number>;
    hourly: number[];         // 24 长度数组，每小时分钟数
    switchCount: number;      // 应用切换次数
  };

  // 历史
  history: Array<{ date: string; totalMins: number; byApp: ... }>;

  // 专注模式
  focus: {
    running: boolean;
    remainingSecs: number;
    completedToday: number;
    task: string;
    blockEntertainment: boolean;
    hideNotifications: boolean;
    whiteNoise: boolean;
  };

  // 用户偏好
  prefs: {
    theme: 'light' | 'dark';
    mascotKind: 'cloud' | 'jelly';
    floatingVariant: 'A' | 'B' | 'C';
    floatingPos: { x: number; y: number };
    startOnBoot: boolean;
    idleDetection: boolean;   // 5min 无输入停表
    sedentaryReminder: boolean;
    dailySummary: boolean;
    appLimits: Record<string, number>;  // exePath -> 分钟上限
  };
}
```

数据持久化：SQLite（推荐）或 JSON 文件在 `%APPDATA%/CloudCloud/`。**所有数据仅本地存储**，不上传。

---

## Design Tokens

### Colors — 核心色板 (问卷选择了第 3 组：蓝紫薄荷)

| Token | Hex | 用途 |
|---|---|---|
| `--paper` | `#F5F1E8` | 米白纸底 |
| `--paper-deep` | `#ECE6D6` | 次级背景 |
| `--cloud-white` | `#FDFCF8` | 卡片白 |
| `--ink` | `#2A2A3C` | 主文字 / 线稿 |
| `--ink-soft` | `#5A5A72` | 次级文字 |
| `--ink-mute` | `#9A9AB0` | 辅助文字 |
| `--blue` | `#A4C8F0` | 天空蓝（沟通/浏览） |
| `--blue-deep` | `#7FA8D6` | — |
| `--lilac` | `#C8B6FF` | 薄紫（强调/今日） |
| `--lilac-deep` | `#A88FE3` | — |
| `--mint` | `#B8E0D2` | 薄荷（工作/积极） |
| `--mint-deep` | `#8FC4B0` | — |
| `--peach` | `#FFCFB8` | 桃色（警示/娱乐） |
| `--peach-deep` | `#E8A085` | — |
| `--lemon` | `#FFE5A8` | 柠檬（高亮/贴士） |

### Dark 模式覆盖
```
--paper:       #1E1E2A
--paper-deep:  #151520
--cloud-white: #2A2A3A
--ink:         #F0ECE0
--ink-soft:    #BDBACF
--ink-mute:    #6A6A82
--line:        #F0ECE0
```

### Typography
- **主字体**: Nunito (400 / 600 / 700 / 800) — 中文 fallback: PingFang SC, Microsoft YaHei
- **手写字体**: Caveat (500 / 700) — 用于大标题、数字强调、装饰
- **韩系手写**: Gaegu (400 / 700) — 中文手写感 fallback

### Scale
```
标题手写:   32–40px / Caveat
大数字:     48–64px / Caveat
正文:       14px / Nunito 400
小标签:     11–12px / Nunito 700 / letter-spacing: 1px
超小:       10–11px / Nunito 700
```

### 圆角 — 手绘不规则风
```
大容器:  18px 22px 20px 24px / 22px 18px 24px 20px
紧凑:    12px 14px 13px 15px / 14px 12px 15px 13px
圆形:    50% 48% 52% 50% / 48% 52% 50% 48%
按钮:    14px 18px 15px 17px / 17px 14px 18px 15px
```

### 阴影 — 偏移黑边（手绘漫画风）
```
轻:   2px 2px 0 #2A2A3C
中:   3px 3px 0 #2A2A3C
重:   4px 4px 0 #2A2A3C
窗口: 6px 6px 0 #2A2A3C, 0 20px 60px rgba(42,42,60,0.15)
```

### Spacing Scale
`4 / 8 / 12 / 14 / 16 / 18 / 20 / 24 / 28 / 32 / 36` px

---

## Assets

所有视觉资产都是 **SVG path 绘制**，无位图：
- `CloudMascot` — 云云主角色（120×90 viewBox），5 种表情在同一 component 内切换
- `JellyMascot` — 果冻备用角色（100×110 viewBox）
- `AppIcon` — 12 种占位图标（code / design / chat / doc / video / music / browse / mail / game / shop / term / draw），实际实现时**请接入 Windows 系统的真实应用图标提取**（通过 `IShellLink` 或 `SHGetFileInfo`）
- `Star` / `SunDoodle` / `TomatoDoodle` — 装饰图
- 手绘波浪线：`styles.css` 的 `.hr-wavy` 使用 inline SVG data-URI

**字体从 Google Fonts 加载**：`Nunito` + `Caveat` + `Gaegu`。生产环境请自托管。

---

## Files in this bundle

| 文件 | 用途 |
|---|---|
| `屏幕使用时间 云云.html` | 入口，拼装所有组件到 design-canvas |
| `styles.css` | 全局 token + 手绘样式 |
| `cloud-mascot.jsx` | 云云 + 果冻吉祥物组件（含 5 种表情） |
| `data.jsx` | 模拟数据 + AppIcon / Star / TomatoDoodle 等工具组件 |
| `tab-today.jsx` | 主窗口"今日"页 + 饼图 + 时间线 mini |
| `tabs-more.jsx` | 主窗口其他 5 个 Tab |
| `main-window.jsx` | Windows 窗口外壳 + 左导航 + Tab 路由 |
| `floating-widget.jsx` | 悬浮窗 3 种变体 + 4 种状态 |
| `desktop-scene.jsx` | 桌面场景包装（任务栏、背景应用图标等） |
| `design-canvas.jsx` | 仅用于展示，实现时可忽略 |

---

## Implementation Notes

### Windows 集成关键点
- **前台应用检测**：`GetForegroundWindow()` + `GetWindowThreadProcessId()` + `QueryFullProcessImageName()`，建议每秒轮询
- **空闲检测**：`GetLastInputInfo()` 返回最后输入时间戳
- **悬浮窗**：
  - 无边框 + `WS_EX_TOOLWINDOW`（不在任务栏显示）
  - `WS_EX_LAYERED` 支持透明
  - `WS_EX_TOPMOST` 保持最上层
  - **拖动**：`WM_NCHITTEST` 返回 `HTCAPTION` 或直接 `ReleaseCapture()` + `PostMessage(WM_NCLBUTTONDOWN, HTCAPTION)`
- **右键菜单**：Electron 用 `Menu.buildFromTemplate` / `popup()`；WinUI 用 `MenuFlyout`；原生用 `TrackPopupMenu`
- **开机自启**：写注册表 `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`
- **数据存储**：SQLite (better-sqlite3 / Microsoft.Data.Sqlite)，schema:
  ```sql
  CREATE TABLE events (
    id INTEGER PRIMARY KEY,
    app_exe TEXT NOT NULL,
    app_name TEXT NOT NULL,
    started_at INTEGER NOT NULL,  -- unix ms
    ended_at INTEGER NOT NULL,
    category TEXT
  );
  CREATE INDEX idx_started ON events(started_at);
  ```

### 性能
- 悬浮窗的 SVG 动画（wobble / blink）用 CSS `@keyframes`，不要用 JS
- 主窗口关闭时切到"仅悬浮窗 + 后台采样"模式，降低内存
- 时间线柱状图若跨 90+ 天需虚拟滚动

### 隐私与安全
- 默认**不**记录窗口标题内容，仅记录可执行文件路径与进程名
- "隐私空白"选项：用户可添加 exe 正则黑名单
- 所有数据仅本地，主窗口"导出"生成 `.json`，"清空"二次确认

---

## Open Questions for Dev

1. 是否支持多显示器场景下记住每个屏幕独立的悬浮窗位置？
2. 番茄专注期间"屏蔽娱乐应用"是硬屏蔽（杀进程/前台切换）还是软提醒？建议软提醒起步。
3. 应用分类规则：初版用硬编码白名单即可，长期需要用户可编辑。
4. 云同步（可选特性）优先级如何？
