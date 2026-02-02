# Mushi Social

**Web3 灵魂身份 × 社交地图** — 连接钱包、发现链上身份、在地图上与蘑菇邻居聊天与加好友。

## 产品概览

- **首页**：Mushi 品牌 + 绿色「Connect Wallet」按钮，点击弹出 RainbowKit 连接弹窗（MetaMask / OKX / Binance / WalletConnect），连接后完成签名再进入 Onboarding。
- **Onboarding**：未连接时访问 `/onboarding` 会重定向到首页；连接后进入 Soul 分析（链上身份）→ 结果页（昵称/性别/兴趣）→ 地图。
- **地图**：Mapbox + 蘑菇标记，点击弹出资料卡（身份标签、加好友、发消息、前往对方位置）；「我」标记点击进入个人页。
- **聊天**：实时聊天列表与单聊；从地图/资料卡进入聊天时，顶部显示对方**真实昵称**（如 CryptoNomad），而非钱包地址。
- **Friends / Notifications / Me**：底部导航（Chat、Friends、Notifications、Me），标题与导航标签统一为 serif 字体风格；Me 页顶部「MUSHI」点击返回地图。
- **3D 场景**：Onboarding/结果页使用粒子蘑菇 3D 背景；WebGL 崩溃时自动切换为静态背景，并配合错误边界，保证连接钱包等按钮始终可用。

## 项目结构

```
Mushi_social/
├── frontend/          # React + Vite 前端应用
├── backend/           # Node.js + Express 后端 API
├── src/               # Solidity 合约（Foundry）
├── script/            # 合约部署脚本（Foundry）
├── foundry.toml       # Foundry 配置
└── README.md          # 项目文档
```

## 技术栈

### 前端
- React 18、Vite、React Router
- Wagmi + RainbowKit（多钱包连接：MetaMask / OKX / Binance / WalletConnect）
- Mapbox GL、Framer Motion、TailwindCSS、Shadcn UI
- React Three Fiber（3D 粒子蘑菇场景）
- 实时聊天（Socket.io + REST）

### 后端
- Node.js
- Express
- MongoDB
- JWT 认证
- Multer (文件上传)

### 合约（Foundry）
- Foundry（forge）编译与部署
- Solidity 0.8.24
- 当前合约：`src/MushiRegistry.sol`（版本/配置注册）
- **部署到 Sepolia 测试网**：见 [docs/CONTRACTS-DEPLOY.md](docs/CONTRACTS-DEPLOY.md)。简要步骤：
  1. 安装 Foundry：`curl -L https://foundry.paradigm.xyz | bash` → `foundryup`
  2. `forge install foundry-rs/forge-std`
  3. 复制 `.env.example` 为 `.env`，填写 `PRIVATE_KEY` 和 `ETH_RPC_URL`（Sepolia RPC，如 `https://rpc.sepolia.org`）
  4. 执行 `npm run deploy:sepolia` 或 `forge script script/Deploy.s.sol:DeployMushiRegistry --rpc-url $ETH_RPC_URL --broadcast`

## 快速开始

### 1. 安装依赖

```bash
npm run install:all
```

### 2. 配置环境变量

**后端**：在 `backend/` 目录下创建 `.env`（可复制 `backend/.env.example`）：

```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/mushi_social
JWT_SECRET=your_jwt_secret
```

**前端**：在 `frontend/` 目录下创建 `.env`（可复制 `frontend/.env.example`）：

- `VITE_MAPBOX_ACCESS_TOKEN`：Mapbox 公网 Token，<https://account.mapbox.com/access-tokens/>（免费额度即可）
- `VITE_WALLETCONNECT_PROJECT_ID`：WalletConnect Cloud 项目 ID，用于钱包连接（MetaMask / WalletConnect 等），<https://cloud.walletconnect.com/> 注册后获取。不填时仅注入式钱包（如 MetaMask 扩展）可用。

### 3. 启动开发服务器

```bash
# 同时启动前后端
npm run dev

# 或分别启动
npm run dev:frontend  # 前端运行在 http://localhost:5173
npm run dev:backend   # 后端运行在 http://localhost:5000
```

## 功能特性

- **钱包连接与签名**：首页绿色 Connect Wallet → RainbowKit 弹窗 → 连接后 MetaMask 签名认证 → 进入 Onboarding 或地图。
- **Soul 链上身份**：连接钱包后拉取链上画像（Web3.bio / Soul API），Onboarding 与 Me 页展示身份标签（Explorer、Degen、Builder 等）。
- **地图与资料卡**：Mapbox 地图、蘑菇用户标记、点击弹出 MushiInfoCard（昵称、身份、加好友、发消息、导航到对方位置）。
- **聊天**：实时会话列表与单聊；从地图进入时显示对方昵称；支持 Socket 推送新消息。
- **Friends / 通知 / Me**：好友列表、通知中心、个人页（头像、昵称、Bio、Night mode、钱包信息）。
- **PWA**：可添加到主屏幕，移动端友好。

## 添加到主屏幕（PWA）

当前前端已配置为 **PWA（Progressive Web App）**，在手机浏览器中打开后可以「添加到主屏幕」，像 App 一样使用：

- **Android**：Chrome 菜单 → 「添加到主屏幕」或「安装应用」
- **iOS**：Safari 分享 → 「添加到主屏幕」

配置说明：

- `frontend/public/manifest.webmanifest`：应用名称、主题色、全屏展示（`display: standalone`）等
- `frontend/public/favicon.svg`：浏览器标签与部分主屏幕图标
- 主屏幕图标：将 **192×192** 和 **512×512** 的 PNG 放入 `frontend/public/icons/`，命名为 `icon-192.png`、`icon-512.png`（见 `frontend/public/icons/README.md`）

## 后续做成 App

若之后希望打包成原生 App（上架应用商店或企业分发），可在现有 Web 基础上做：

- **Capacitor**：用当前 React 项目打包成 iOS/Android App，复用同一套前端代码，适合「先网页、后 App」的路径
- **React Native**：若希望完全原生体验，可另起 RN 项目，与现有 Web 共享接口与业务逻辑

当前 PWA 已支持「添加到主屏幕」，无需改代码即可在手机上当 App 用；后续再按需接入 Capacitor 等即可。

## Soul 身份画像（连接钱包后分析）

流程：**连接钱包 → 后端按地址拉取多源数据 → Soul Brain 输出标签**。

- **Miner（身份矿工）**：`backend/src/services/identityMiner.js`
  - 核心：**Web3.bio** `GET https://api.web3.bio/profile/{identity}`（0x 或 ENS），一键聚合 ENS / Farcaster / Lens 等，返回 `social[].social.follower` 等
  - 补充：Snapshot 投票数、Alchemy 交易数/NFT/账户年龄、Tally 提案数（可选）
- **Brain（灵魂分类）**：`backend/src/services/soulBrain.js`
  - 按身份矩阵输出标签：DAO Governor、Active Voter、Buidler、Degen、Whale、Alpha Hunter、Social Star、Newbie、Explorer
- **API**：`GET /api/soul/:address` 返回 `{ address, raw, tags }`
- **前端**：连接钱包后，Onboarding Soul 步骤与设置页会请求 `/api/soul/:address` 并展示标签

可选环境变量（后端 `.env`）：`WEB3_BIO_API_KEY`、`ALCHEMY_API_KEY`、`TALLY_API_KEY`（见 `backend/.env.example`）。

## 设计 & API 风格统一

- **设计**：可爱 + 酷炫（Blink 风格）、3D 软胶感、果冻色调；动效见 `frontend/src/lib/motion.js`（Spring 300/20）。
- **后端 API**：统一响应格式 `{ success, data? }` / `{ success: false, message }`，见 `backend/API.md`、`backend/src/utils/response.js`。
- **路由与 PRD 对齐**：见 `docs/PRD-Routes-Design.md`。

## 开发进度

- [x] 前端基础框架（React + Vite）
- [x] 后端 API 框架
- [x] 首页 Connect Wallet（绿色按钮 + RainbowKit 弹窗）、连接后签名再进入 Onboarding
- [x] Onboarding 流程（未连接重定向首页；连接后 Soul 分析 → 结果页 → 地图）
- [x] 地图（Mapbox + 蘑菇标记 + MushiInfoCard：加好友、发消息、导航）
- [x] 聊天（列表 + 单聊，从地图进入时显示对方昵称）
- [x] Friends / Notifications / Me 页与底部导航（serif 字体统一）
- [x] PWA、钱包连接（RainbowKit + wagmi）、Soul 身份画像
- [x] 3D 场景 WebGL 崩溃保护与错误边界
- [ ] 动态发布与社交互动

## License

MIT
