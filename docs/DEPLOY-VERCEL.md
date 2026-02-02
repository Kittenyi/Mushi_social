# 将 Mushi Social 前端部署到 Vercel

部署到 Vercel 后，你可以从任意设备通过浏览器访问前端，无需在本机跑开发服务器。

## 一、部署前端（Vercel）

### 1. 连接 GitHub

1. 打开 [vercel.com](https://vercel.com)，用 GitHub 登录。
2. 点击 **Add New…** → **Project**。
3. 选择你的仓库 **Kittenyi/Mushi_social**（或你 fork 的仓库），点击 **Import**。

### 2. 配置项目

- **Root Directory**：点击 **Edit**，填 `frontend`，回车确认（只部署前端目录）。
- **Framework Preset**：选 **Vite**（一般会自动识别）。
- **Build Command**：留空或 `npm run build`。
- **Output Directory**：留空或 `dist`。

### 3. 环境变量（Environment Variables）

在 **Environment Variables** 里添加（Production / Preview / Development 按需勾选）：

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `VITE_MAPBOX_ACCESS_TOKEN` | Mapbox 公网 Token，[申请](https://account.mapbox.com/access-tokens/) | 是（否则地图不显示） |
| `VITE_WALLETCONNECT_PROJECT_ID` | [WalletConnect Cloud](https://cloud.walletconnect.com/) 项目 ID | 否（不填则仅注入式钱包可用） |
| `VITE_API_URL` | 后端 API 根地址（见下方「后端」） | 否（不填则 Soul/聊天等接口会请求失败） |

例如：

- `VITE_MAPBOX_ACCESS_TOKEN` = `pk.eyJ1IjoieW91ci11c2VybmFtZSI...`
- `VITE_WALLETCONNECT_PROJECT_ID` = `abc123...`
- `VITE_API_URL` = `https://your-backend.railway.app`（后端部署后的地址）

保存后点击 **Deploy**。

### 4. 部署完成

部署成功后，Vercel 会给你一个地址，例如：`https://mushi-social-xxx.vercel.app`。  
之后可从手机、平板、别的电脑直接打开该链接访问前端。

---

## 二、后端与 API（可选）

当前前端会请求：

- **Soul 链上身份**：`GET /api/soul/:address`
- **实时聊天**：WebSocket + REST，依赖后端服务

如果**不部署后端**：

- 地图、钱包连接、Onboarding 流程、Me 页等仍可正常使用。
- Soul 画像、聊天等依赖后端接口的功能会不可用或降级。

如果**要完整功能**，需要把后端单独部署到其他平台，例如：

- [Railway](https://railway.app)：连 GitHub，选 `backend` 目录，设置 `MONGODB_URI` 等环境变量。
- [Render](https://render.com)：New Web Service，连仓库，Root 设为 `backend`，启动命令 `npm run dev` 或 `npm start`。

后端部署好后，把其**根地址**（如 `https://xxx.railway.app`）填到前端的 **VITE_API_URL**，在 Vercel 里重新部署一次前端即可。

---

## 三、简要检查清单

- [ ] GitHub 仓库已推送到最新代码。
- [ ] Vercel 项目 Root Directory = `frontend`。
- [ ] 已配置 `VITE_MAPBOX_ACCESS_TOKEN`（必填）。
- [ ] 需要 WalletConnect 时配置 `VITE_WALLETCONNECT_PROJECT_ID`。
- [ ] 需要 Soul/聊天时部署后端并配置 `VITE_API_URL`。
- [ ] 部署完成后用手机或另一台电脑打开 Vercel 给的链接，确认可访问。

完成以上步骤后，无需再用本机跑 `npm run dev`，即可从任意设备访问前端。
