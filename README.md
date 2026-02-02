# Mushi Social

**Readme : Introduction, Architecture Doc, Build Instructions**

---

## Introduction

**Web3 灵魂身份 × 社交地图** — 连接钱包、发现链上身份、在地图上与蘑菇邻居聊天与加好友。

### 产品概览

- **首页**：Mushi 品牌 + 绿色「Connect Wallet」按钮，点击弹出 RainbowKit 连接弹窗（MetaMask / OKX / Binance / WalletConnect），连接后完成签名再进入 Onboarding。
- **Onboarding**：未连接时访问 `/onboarding` 会重定向到首页；连接后进入 Soul 分析（链上身份）→ 结果页（昵称/性别/兴趣）→ 地图。
- **地图**：Mapbox + 蘑菇标记，点击弹出资料卡（身份标签、加好友、发消息、前往对方位置）；「我」标记点击进入个人页。
- **聊天**：实时聊天列表与单聊；从地图/资料卡进入聊天时，顶部显示对方**真实昵称**（如 CryptoNomad），而非钱包地址。
- **Friends / Notifications / Me**：底部导航（Chat、Friends、Notifications、Me），标题与导航标签统一为 serif 字体风格；Me 页顶部「MUSHI」点击返回地图。
- **3D 场景**：Onboarding/结果页使用粒子蘑菇 3D 背景；WebGL 崩溃时自动切换为静态背景，并配合错误边界，保证连接钱包等按钮始终可用。

### 功能特性

- **钱包连接与签名**：首页绿色 Connect Wallet → RainbowKit 弹窗 → 连接后 MetaMask 签名认证 → 进入 Onboarding 或地图。
- **Soul 链上身份**：连接钱包后拉取链上画像（Web3.bio / Soul API），Onboarding 与 Me 页展示身份标签（Explorer、Degen、Builder 等）。
- **地图与资料卡**：Mapbox 地图、蘑菇用户标记、点击弹出 MushiInfoCard（昵称、身份、加好友、发消息、导航到对方位置）。
- **聊天**：实时会话列表与单聊；从地图进入时显示对方昵称；支持 Socket 推送新消息。
- **Friends / 通知 / Me**：好友列表、通知中心、个人页（头像、昵称、Bio、Night mode、钱包信息）。
- **PWA**：可添加到主屏幕，移动端友好。

---

## Architecture Doc

### 项目结构

```
Mushi_social/
├── frontend/          # React + Vite 前端应用
├── backend/           # Node.js + Express 后端 API
├── src/               # Solidity 合约（Foundry）
├── script/            # 合约部署脚本（Foundry）
├── foundry.toml       # Foundry 配置
├── docs/              # 设计文档、PRD、合约部署说明等
└── README.md
```

### 技术栈

**前端**

- React 18、Vite、React Router
- Wagmi + RainbowKit（多钱包连接：MetaMask / OKX / Binance / WalletConnect）
- Mapbox GL、Framer Motion、TailwindCSS、Shadcn UI
- React Three Fiber（3D 粒子蘑菇场景）
- 实时聊天（Socket.io + REST）

**后端**

- Node.js、Express、MongoDB
- JWT 认证、Multer（文件上传）

**合约（Foundry）**

- Foundry（forge）编译与部署，Solidity 0.8.24
- 当前合约：`src/MushiRegistry.sol`（版本/配置注册）
- Sepolia 部署说明：见 [docs/CONTRACTS-DEPLOY.md](docs/CONTRACTS-DEPLOY.md)

### Soul 身份画像

流程：**连接钱包 → 后端按地址拉取多源数据 → Soul Brain 输出标签**。

- **Miner（身份矿工）**：`backend/src/services/identityMiner.js` — Web3.bio 聚合 ENS / Farcaster / Lens 等
- **Brain（灵魂分类）**：`backend/src/services/soulBrain.js` — 输出 DAO Governor、Buidler、Degen、Whale、Explorer 等标签
- **API**：`GET /api/soul/:address` 返回 `{ address, raw, tags }`

### 设计 & API 风格

- **设计**：可爱 + 酷炫（Blink 风格）、3D 软胶感、果冻色调；动效见 `frontend/src/lib/motion.js`（Spring 300/20）。
- **后端 API**：统一响应格式 `{ success, data? }` / `{ success: false, message }`，见 `backend/API.md`、`backend/src/utils/response.js`。
- **路由与 PRD**：见 `docs/PRD-Routes-Design.md`。

---

## Build Instructions

### 1. 安装依赖

```bash
npm run install:all
```

### 2. 配置环境变量

**后端**：在 `backend/` 下创建 `.env`（可复制 `backend/.env.example`）：

```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/mushi_social
JWT_SECRET=your_jwt_secret
```

可选：`WEB3_BIO_API_KEY`、`ALCHEMY_API_KEY`、`TALLY_API_KEY`（见 `backend/.env.example`）。

**前端**：在 `frontend/` 下创建 `.env`（可复制 `frontend/.env.example`）：

- `VITE_MAPBOX_ACCESS_TOKEN`：Mapbox Token，<https://account.mapbox.com/access-tokens/>
- `VITE_WALLETCONNECT_PROJECT_ID`：WalletConnect 项目 ID，<https://cloud.walletconnect.com/>（不填时仅注入式钱包可用）

### 3. 启动开发服务器

```bash
# 同时启动前后端
npm run dev

# 或分别启动
npm run dev:frontend  # 前端 http://localhost:5173（端口占用时自动切到 5174 等）
npm run dev:backend   # 后端 http://localhost:5001
```

### 4. 合约部署（Sepolia）

1. 安装 Foundry：`curl -L https://foundry.paradigm.xyz | bash` → `foundryup`
2. `forge install foundry-rs/forge-std`
3. 项目根目录复制 `.env.example` 为 `.env`，填写 `PRIVATE_KEY`、`ETH_RPC_URL`（如 `https://rpc.sepolia.org`）
4. 执行 `npm run deploy:sepolia` 或见 [docs/CONTRACTS-DEPLOY.md](docs/CONTRACTS-DEPLOY.md)

### 5. PWA（添加到主屏幕）

- **Android**：Chrome 菜单 → 「添加到主屏幕」或「安装应用」
- **iOS**：Safari 分享 → 「添加到主屏幕」

配置：`frontend/public/manifest.webmanifest`、`frontend/public/favicon.svg`；主屏幕图标见 `frontend/public/icons/README.md`。

### 6. 部署到 Vercel（线上访问）

将前端部署到 Vercel 后，可从任意设备通过链接访问，无需本机跑开发服务器。步骤见 **[docs/DEPLOY-VERCEL.md](docs/DEPLOY-VERCEL.md)**：连接 GitHub → Root 设为 `frontend` → 配置 `VITE_MAPBOX_ACCESS_TOKEN` 等环境变量 → 部署。

### 开发进度

- [x] 前端基础框架（React + Vite）
- [x] 首页 Connect Wallet、连接后签名再进入 Onboarding
- [x] Onboarding 流程、地图（Mapbox + 蘑菇标记 + MushiInfoCard）
- [x] 聊天（列表 + 单聊，从地图进入时显示对方昵称）
- [x] Friends / Notifications / Me、PWA、Soul 身份画像
- [x] 3D 场景 WebGL 崩溃保护与错误边界
- [ ] 动态发布与社交互动

---

## License

MIT
