# Mushi 前后端 PRD · 当前代码拆解

> 清晰简洁的现状 PRD，便于迭代与交接。

---

## 一、产品定位

**Mushi**：Web3 社交地图 · 基于位置的灵魂社交。  
用户用钱包连接 → 生成 Soul 身份标签 → 设置资料 → 开启 LBS → 在地图上看附近的人、聊天。

---

## 二、技术栈

| 层级 | 技术 |
|------|------|
| **前端** | React 18、Vite、Tailwind、React Router、wagmi + RainbowKit、XMTP（动态加载）、Mapbox GL JS |
| **后端** | Node.js、Express、MongoDB（Mongoose）、JWT、CORS |
| **身份/Soul** | Web3.bio、Snapshot、Alchemy、Tally（可选） |

---

## 三、前端拆解

### 3.1 路由与页面

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | WelcomePage | 已完成引导时：未连钱包显示 Connect + 邮箱注册；**已连钱包直接跳地图**，并在地图显示「欢迎回来，xx」 |
| `/onboarding` | OnboardingLayout | 5 步引导（见下） |
| `/onboarding/wallet` | ConnectWalletStep | 连接钱包，连接成功约 1.2s 后自动进 Soul |
| `/onboarding/soul` | SoulStep | 调后端 Soul API，展示灵魂类型 + 蘑菇颜色 |
| `/onboarding/profile` | ProfileStep | 昵称 + 头像（默认蘑菇 / 上传） |
| `/onboarding/lbs` | LBSStep | 请求定位、说明用途、可跳过 → 完成后进地图 |
| `/map` | MapPage | 地图主屏（Mapbox），顶部「欢迎回来」条（来自欢迎页跳转） |
| `/chat` | ChatListPage | XMTP 对话列表 |
| `/chat/:id` | ChatDetailPage | XMTP 单聊（id 为 0x 地址） |
| `/profile/:id` | ProfilePage | 他人/自己 Profile |
| `/notifications` | NotificationsPage | 通知（占位） |
| `/settings` | SettingsPage | 我：钱包、头像、昵称、性别、Soul、清除引导状态 |

- **OnboardingGate**：未完成引导访问 `/map`、`/chat`、`/notifications`、`/settings`、`/profile/:id` 时 → 重定向到 `/onboarding`。

### 3.2 5 步引导流程（Onboarding）

1. **欢迎**：Mushi Logo + 3D 蘑菇动画 +「Connect wallet」弹性按钮 → 点进 wallet。
2. **连接钱包**：RainbowKit（MetaMask / WalletConnect / Coinbase 等），连接成功 1.2s 后自动进 soul。
3. **Soul 形象**：`GET /api/soul/:address` → 展示灵魂类型（Degen/Collector/Builder/Explorer 等）、蘑菇颜色、Soul Card 弹跳入场。
4. **个人资料**：昵称 + 头像（默认蘑菇或上传），写入 `useProfileStore`（localStorage）。
5. **LBS**：请求定位、说明「附近好友」、可跳过 → `setOnboardingDone()` + 进 `/map`。

引导完成状态：`localStorage['mushi_onboarding_done']`；`getOnboardingDone` / `setOnboardingDone` / `clearOnboardingDone` 在 `lib/onboarding.js`。

### 3.3 状态与数据

| 模块 | 说明 |
|------|------|
| **wagmi + RainbowKit** | 链、钱包连接、useAccount / useWalletClient |
| **XmtpProvider** | 用钱包 signer 创建 XMTP Client，动态 `import('@xmtp/browser-sdk')` |
| **useProfileStore** | 昵称、性别、头像 URL、邮箱，存 `localStorage['mushi_profile']` |
| **useAuthStore** | 可选登录态（与后端 JWT 对接可扩展） |
| **useMapStore** | 地图相关状态（可扩展） |

### 3.4 前端与后端对接

- **Soul**：`lib/soulApi.js` → `GET ${VITE_API_URL}/api/soul/:address`，用于 SoulStep、Settings 展示。
- **地图**：Mapbox 前端直连（`VITE_MAPBOX_ACCESS_TOKEN`），**不经过后端**；附近用户目前为前端 MOCK。

---

## 四、后端拆解

### 4.1 API 路由总览

| 前缀 | 说明 | 鉴权 |
|------|------|------|
| `GET /api/health` | 健康检查 | 无 |
| `/api/auth` | 注册/登录/JWT | 部分 |
| `/api/soul` | 身份 + Soul 标签 | 无 |
| `/api/users` | 用户资料、关注 | JWT |
| `/api/posts` | 动态 CRUD、点赞、评论 | JWT |
| `/api/location` | 位置上报、附近（路由在，控制器注释） | JWT |
| `/api/mushi` | Mushi 阶段/Persona（路由在，控制器注释） | JWT |
| `/api/x402` | x402 咨询/Ping（路由在，控制器注释） | JWT |

### 4.2 已实现接口

- **Auth** `POST /api/auth/register`、`POST /api/auth/login`、`GET /api/auth/me`（Bearer JWT）。
- **Soul** `GET /api/soul/:address`：参数为 0x 或 ENS；内部调 `identityMiner.getRawIdentityData` + `soulBrain.classifySoul`，返回 `{ address, raw: { social, txCount, nftsCount, voteCount, proposalCount }, tags }`。
- **Users** `GET/PUT /api/users/:id`、`PUT /api/users/:id/follow`、`PUT /api/users/:id/unfollow`（需 JWT）。
- **Posts** 增删查、点赞、评论（需 JWT）。

### 4.3 仅挂路由、逻辑未接

- **Location**：`PUT /`、`GET /nearby` 已注释，地图附近人目前前端 MOCK。
- **Mushi**：`GET /me`、`GET /:userId` 已注释。
- **x402**：`/ping`、`/consult/start`、`/consult/end`、`/consult/pricing` 已注释。

### 4.4 Soul 数据流（后端）

1. **identityMiner**：聚合 Web3.bio（社交）、Snapshot（投票）、Alchemy（交易/NFT/合约部署/账户年龄）、Tally（提案）；需可选 env：`WEB3_BIO_API_KEY`、`ALCHEMY_API_KEY`、`TALLY_API_KEY`。
2. **soulBrain**：按规则打标签，如 DAO Governor、Active Voter、Buidler、Degen、Whale、Explorer 等，返回 `[{ label, color }]`。

### 4.5 鉴权

- `middleware/auth.js`：从 `Authorization: Bearer <token>` 取 JWT，校验后挂 `req.user`。
- 前端当前以钱包 + XMTP 为主，未强制走 `/api/auth/login` 拿 JWT；需要调受保护接口时可后续接「钱包签名登录」换 JWT。

---

## 五、环境变量（要点）

**前端 `.env`**

- `VITE_MAPBOX_ACCESS_TOKEN`：地图必填。
- `VITE_API_URL`：后端地址，如 `http://localhost:5001`。
- `VITE_WALLETCONNECT_PROJECT_ID`：RainbowKit/WalletConnect。

**后端 `.env`**

- `PORT`、`MONGODB_URI`、`JWT_SECRET`、`CLIENT_URL`。
- 可选：`WEB3_BIO_API_KEY`、`ALCHEMY_API_KEY`、`TALLY_API_KEY`（Soul 数据更全）。

---

## 六、用户主流程（当前）

1. 打开 App → 若未完成引导 → 进 `/onboarding` 步骤 1。
2. 步骤 1 点「Connect wallet」→ 步骤 2 连钱包 → 自动进步骤 3 Soul。
3. 步骤 3 展示 Soul → 步骤 4 填昵称/头像 → 步骤 5 LBS（可跳过）→ 进 `/map`。
4. 再次打开且已连钱包 → 直接进 `/map`，顶部显示「欢迎回来，{昵称}～」。
5. 地图、聊天（XMTP）、设置（我）为主功能；附近用户为前端 MOCK，待接 `/api/location/nearby`。

---

## 七、可选后续迭代（PRD 级）

- 后端：实现 `PUT/GET /api/location`，前端地图用「附近的人」接口替换 MOCK。
- 后端：实现 `/api/mushi`、`/api/x402`，前端对应页面对接。
- 前端：钱包签名登录换 JWT，调用需鉴权接口。
- 前端：通知页、Profile 他人页与后端用户/关注关系对接。

---

*文档基于当前仓库代码整理，与实现保持一致。*
