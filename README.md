# Mushi Social

一个全栈社交媒体应用项目。

## 项目结构

```
Mushi_social/
├── frontend/          # React + Vite 前端应用
├── backend/           # Node.js + Express 后端 API
└── README.md          # 项目文档
```

## 技术栈

### 前端
- React 18
- Vite
- React Router
- Axios
- TailwindCSS

### 后端
- Node.js
- Express
- MongoDB
- JWT 认证
- Multer (文件上传)

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

- 用户注册和登录
- 发布和浏览动态
- 点赞和评论
- 用户资料管理
- 图片上传
- 实时通知

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
- [x] Onboarding / 地图 / Profile / 聊天占位 / 通知 / 设置
- [x] PWA 配置（可添加到主屏幕）
- [x] 钱包连接（RainbowKit + wagmi）
- [x] Soul 身份画像（连接钱包后 Miner + Brain）
- [x] 前后端风格统一（response 工具 + API 约定 + motion 常量）
- [ ] 动态发布与社交互动

## License

MIT
