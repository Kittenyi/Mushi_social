# AuraCity (Sabai Mushi Edition) - 产品需求文档

**项目名称**: AuraCity（产品代号：**Mushi**）  
**产品定位**: 基于地理位置 (LBS) 与链上身份行为 (DID) 的 Web3 沉浸式社交 App  
**设计灵感**: Blink / Zenly (交互) + Web3 基因 (叙事) + 清迈 (氛围)

> **当前实现与本文档的对应关系**：见 [PRD-当前代码拆解.md](./PRD-当前代码拆解.md)。本文档保留产品愿景与规范，实现状态以《当前代码拆解》为准。

---

## 1. 产品核心价值 (Core Value)

AuraCity 通过将链上数据转化为可生长的「灵魂形象 (Soul)」，并在真实地理坐标上展示，增强 Web3 社交的代入感。用户通过「灵魂类型」与地图上的附近的人建立连接，并通过 XMTP 实现端到端加密聊天；后续可扩展 X402 协议实现知识/社交变现。

---

## 2. 用户流程 (User Journey)

### 2.1 当前已实现的入注册流 (Onboarding)

| Step | 名称 | 说明（与代码一致） |
|------|------|---------------------|
| 1 | 欢迎 | Mushi Logo + 3D 蘑菇动画 +「Connect wallet」弹性按钮 |
| 2 | 连接钱包 | RainbowKit（MetaMask、WalletConnect、Coinbase 等），连接成功约 1.2s 后自动进入下一步 |
| 3 | 灵魂唤醒 (Soul) | 根据钱包地址调用 Soul API，展示灵魂类型（Degen/Collector/Builder/Explorer 等），蘑菇颜色随类型变化，Soul Card 弹跳入场 |
| 4 | 个人资料 | 昵称 + 头像（默认蘑菇或上传自定义） |
| 5 | 开启 LBS | 请求定位权限、说明「附近好友」用途、用户可跳过 → 完成后进入地图 |

### 2.2 森林地表 (LBS Map) — 当前实现

- **视角**: Mapbox 暗色主题，倾斜视角。
- **地图元素**:
  - **本人**: 蓝圈 + 蘑菇标记，支持浏览器定位居中。
  - **他人**: 模拟附近用户头像与一句话状态气泡（当前为前端 MOCK，待接 `/api/location/nearby`）。
  - **交互**: 点击地图平滑飞向、悬停头像显示信息卡（Add Friend / Message / Go to Location），点击头像进入 Profile。

*愿景中「菌丝连线」「热力脉动」等为后续扩展。*

---

## 3. 核心功能规范 (Functional Specs)

### 3.1 灵魂标签 (Soul) — 已实现

- 后端 **identityMiner** 聚合 Web3.bio、Snapshot、Alchemy、Tally；**soulBrain** 输出标签（DAO Governor、Active Voter、Buidler、Degen、Whale、Explorer 等）。
- 前端 Onboarding 步骤 3 与设置页展示 Soul 类型与蘑菇颜色。详见 [IDENTITY-TAGS.md](./IDENTITY-TAGS.md)。

### 3.2 蘑菇进化系统 (Mushi Evolution) — 愿景

| 阶段 | 触发条件 | 视觉特征 |
|------|----------|----------|
| 孢子 (Spore) | 钱包年龄 < 30 天 | 半透明球体，果冻质感 |
| 幼苗 (Sprout) | 交互协议 < 3 个 | 浅色小蘑菇，带未脱落蛋壳装饰 |
| 成熟 (Mature) | 活跃用户 | 完整菌盖，色彩饱和，可加载外挂饰品 |

*当前前端为 Soul 标签 + 蘑菇颜色映射，进化阶段与 3D 模型为后续扩展。*

### 3.3 X402 互动协议 — 愿景

- **Ping**: 免费，点击后对方触感反馈、地图形象波纹。
- **咨询连接**: 大 V 定价（如 10 USDC/10min）。
- **共生罩**: 咨询开始后双方状态展示。

*后端路由已挂载，控制器未实现；前端有 x402 组件占位。*

---

## 4. 技术实现 (当前技术栈)

| 层级 | 技术 |
|------|------|
| 前端 | React 18、Vite、Tailwind、React Router、wagmi + RainbowKit、XMTP（动态加载）、Mapbox GL JS |
| 后端 | Node.js、Express、MongoDB（Mongoose）、JWT |
| 身份/Soul | Web3.bio、Snapshot、Alchemy、Tally（可选） |
| 地理 | Mapbox（前端直连）；H3 与位置快照在后端预留（location 控制器未接） |

---

## 5. 隐私与安全 (Privacy & Security)

- **定位**: 用户可选择跳过 LBS；说明仅用于「附近好友」展示，可随时在设置中关闭。
- **资产脱敏**: Soul 仅展示身份标签（如 Whale、Degen），不展示具体资产数值。
- **聊天**: XMTP 端到端加密，密钥由钱包控制。

---

## 6. 参考文档

- [PRD-当前代码拆解](./PRD-当前代码拆解.md) — 前后端现状与 API、路由、流程
- [DESIGN-Mushi-Visual-Spec.md](./DESIGN-Mushi-Visual-Spec.md) — **视觉与交互规范**（Blink + 发光森林、成长阶段 Spore/Sprout/Mature、Persona 视觉映射、清迈 Sabai、菌丝、Ping/X402、1+N 建模、Three.js、用户自建身份层）
- [IDENTITY-TAGS.md](./IDENTITY-TAGS.md) — Soul 标签逻辑与 API
- [DEV-PLAN-Mushi.md](./DEV-PLAN-Mushi.md) — 开发阶段与页面结构
- [CHECKLIST-Mushi.md](./CHECKLIST-Mushi.md) — 功能逐项核对清单
