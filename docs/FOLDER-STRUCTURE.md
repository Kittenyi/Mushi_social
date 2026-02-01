# Mushi 文件夹结构说明

与当前代码一致。详细 API 与流程见 [PRD-当前代码拆解.md](./PRD-当前代码拆解.md)。

---

## 文档索引

| 文档 | 说明 |
|------|------|
| [PRD-当前代码拆解.md](./PRD-当前代码拆解.md) | 前后端现状、API、路由、流程 |
| [PRD-AuraCity-Sabai-Mushi.md](./PRD-AuraCity-Sabai-Mushi.md) | 产品愿景与规范 |
| [DEV-PLAN-Mushi.md](./DEV-PLAN-Mushi.md) | 开发阶段与页面结构 |
| [CHECKLIST-Mushi.md](./CHECKLIST-Mushi.md) | 功能逐项核对清单 |
| [IDENTITY-TAGS.md](./IDENTITY-TAGS.md) | Soul 标签与 API |
| [XMTP.md](./XMTP.md) | XMTP 聊天接入 |
| [FOLDER-STRUCTURE.md](./FOLDER-STRUCTURE.md) | 本文件 |

---

## 前端 (frontend/src)

### 路由 (App.jsx)

| 路径 | 说明 |
|------|------|
| `/` | 欢迎页。未完成引导 → 重定向 /onboarding；已完成且已连钱包 → 直接进 /map 并显示「欢迎回来」 |
| `/onboarding/*` | 5 步引导：欢迎 → wallet → soul → profile → lbs |
| `/map` | 地图主界面（Mapbox），顶部欢迎回来条 |
| `/profile/:id` | 用户 Profile |
| `/chat` | XMTP 对话列表 |
| `/chat/:id` | XMTP 聊天详情（id 为对方 0x 地址） |
| `/notifications` | 通知中心（占位） |
| `/settings` | 个人设置（我） |

`/map`、`/chat`、`/notifications`、`/settings`、`/profile/:id` 由 **OnboardingGate** 包裹：未完成引导时重定向到 `/onboarding`。

### 页面 (pages/)

- WelcomePage, OnboardingLayout（WelcomeStep, ConnectWalletStep, SoulStep, ProfileStep, LBSStep）
- MapPage, ProfilePage, ChatListPage, ChatDetailPage, NotificationsPage, SettingsPage

### 组件 (components/)

| 目录 | 说明 |
|------|------|
| **onboarding/** | WelcomeStep, ConnectWalletStep, SoulStep, ProfileStep, LBSStep, OnboardingShell, StepIndicator |
| **map/** | MapView, MapMarker, MyceliumLine, HeatLayer |
| **chat/** | MessageBubble, ChatInput |
| **layout/** | NavBar（底部：地图、聊天、通知、我） |
| **profile/** | ProfileCard |
| **notifications/** | NotificationBell, NotificationItem |
| **OnboardingGate.jsx** | 未完成引导时重定向到 /onboarding |
| 3d/, mushi/, x402/, ui/ | 占位或扩展用 |

### 状态与逻辑

- **context/** — XmtpProvider（signer → XMTP Client）, AuthContext, MapContext
- **stores/** — useProfileStore（昵称、性别、头像、邮箱，localStorage）, useAuthStore, useMapStore
- **lib/** — wagmi 配置、soulApi（GET /api/soul/:address）、onboarding（完成标记）、xmtpSigner、mapbox
- **hooks/** — useXmtpConversation（useConversation, useMessages, useSendMessage）, useWallet, useLocation, useH3, useMushiEvolution

---

## 后端 (backend/src)

### API 路由 (server.js)

| 前缀 | 说明 | 鉴权 |
|------|------|------|
| GET /api/health | 健康检查 | 无 |
| /api/auth | 注册、登录、GET /me | 部分 |
| /api/soul | GET /:address，身份 + Soul 标签 | 无 |
| /api/users | 用户 CRUD、follow/unfollow | JWT |
| /api/posts | 动态 CRUD、点赞、评论 | JWT |
| /api/location | 位置上报、附近（路由在，控制器未接） | JWT |
| /api/mushi | Mushi 阶段（路由在，控制器未接） | JWT |
| /api/x402 | Ping、咨询（路由在，控制器未接） | JWT |

### 目录

- **config/** — db（MongoDB 连接）
- **controllers/** — auth, soul, users, posts, location（注释）, mushi（注释）, x402（注释）
- **middleware/** — auth（JWT Bearer）
- **models/** — User, Post, LocationSnapshot
- **routes/** — 对应各 API 前缀
- **services/** — identityMiner（Web3.bio + Snapshot + Alchemy + Tally）, soulBrain（标签分类）, h3, ipfs
