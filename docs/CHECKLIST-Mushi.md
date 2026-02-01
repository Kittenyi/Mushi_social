# Mushi 开发计划 · 查漏补缺清单

对照当前代码库的逐项状态。实现细节见 [PRD-当前代码拆解.md](./PRD-当前代码拆解.md)。

---

## 第一阶段：Onboarding 流程

| 项 | 状态 | 说明 |
|----|------|------|
| 步骤 1：Mushi Logo + 3D 蘑菇动画 | ✅ | 透视 + float 动画，Connect wallet 弹性按钮 |
| 步骤 1：Connect wallet 弹性点击 | ✅ | btn-elastic |
| 步骤 2：RainbowKit 钱包弹窗 | ✅ | ConnectButton，MetaMask / WalletConnect / Coinbase 等 |
| 步骤 2：连接成功自动进入下一步 | ✅ | isConnected 后约 1.2s 跳 /onboarding/soul |
| 步骤 3：根据钱包地址生成灵魂类型 | ✅ | GET /api/soul/:address，identityMiner + soulBrain |
| 步骤 3：蘑菇颜色随类型变化 | ✅ | Degen/Collector/Builder/Explorer 等对应渐变 |
| 步骤 3：Soul Card 弹跳入场 | ✅ | animate-bounce-in |
| 步骤 4：昵称输入 | ✅ | useProfileStore，localStorage |
| 步骤 4：头像默认蘑菇 / 上传 | ✅ | 点击上传，base64 存 profile store |
| 步骤 5：请求定位权限 | ✅ | LBSStep 内 getCurrentPosition，可跳过 |
| 步骤 5：说明 + 跳过 | ✅ | 说明「附近好友」，跳过进地图 |

---

## 第二阶段：地图主界面

| 项 | 状态 | 说明 |
|----|------|------|
| Mapbox 暗色主题 | ✅ | dark-v11 |
| 用户当前位置居中 | ✅ | 浏览器定位 + 默认清迈 |
| 自己的头像 | ✅ | 蓝圈 + 蘑菇标记 |
| 其他用户头像分布 | ✅ | 前端 MOCK 3 人，待接 /api/location/nearby |
| 一句话状态气泡 | ✅ | 悬停信息卡内展示 |
| 点击任意位置 → 相机平滑 | ✅ | flyTo |
| 悬停头像 → 信息卡 | ✅ | Add Friend / Message / Go to Location |
| 信息卡：Add Friend / Message / Go | ✅ | 按陌生人/好友区分 |
| 点击头像 → 进入 Profile | ✅ | navigate(`/profile/${user.id}`) |

---

## 第三阶段：Profile 页面

| 项 | 状态 | 说明 |
|----|------|------|
| 路由 /profile/:id | ✅ | ProfilePage 存在 |
| 大头像 + 用户名 | ⚠️ | Settings（我）有；他人 Profile 页可扩展 |
| Soul 类型标签 | ⚠️ | Settings 展示；Profile 页可接 |
| 陌生人：Add Friend + Message | ❌ | 未实现好友关系与请求 |
| 已好友：Message + Go to Their Location | ❌ | 未实现 |
| 「到Ta那里去」：地图飞过去 | ❌ | 未实现 |
| 全屏玻璃质感弹窗 | ❌ | 当前为独立页，非弹窗 |

---

## 第四阶段：聊天界面

| 项 | 状态 | 说明 |
|----|------|------|
| XMTP 端到端加密 | ✅ | @xmtp/browser-sdk，动态 import，signer 来自钱包 |
| 对话列表页 /chat | ✅ | listDms()，按 0x 地址展示 |
| 聊天详情页 /chat/:id | ✅ | id 为 0x 时 fetchDm、useMessages、useSendMessage |
| 顶部对方头像/名字 | ✅ | 对方地址缩写 |
| 消息按时间排序 | ✅ | messages 列表展示 |
| 底部输入 + 发送 | ✅ | 发送逻辑已接 XMTP |
| 消息弹性动效 | ⚠️ | 基础样式有，可加强 |

---

## 第五阶段：通知系统

| 项 | 状态 | 说明 |
|----|------|------|
| 新好友请求 / 通过 / 新消息 | ❌ | 后端可扩展，前端未接 |
| 铃铛图标 + 未读红点 | ❌ | 未在 NavBar 中加铃铛 |
| 下拉通知列表 | ❌ | NotificationsPage 占位 |
| 接受/拒绝/查看 | ❌ | 未实现 |
| 好友请求流程 A→B→接受/拒绝 | ❌ | 未实现 |

---

## 第六阶段：分享功能

| 项 | 状态 | 说明 |
|----|------|------|
| 分享 Profile 链接 | ❌ | 未实现 |
| 分享当前位置 | ❌ | 未实现 |
| 分享卡片（二维码） | ❌ | 未实现 |
| 复制 / Twitter / 微信等 | ❌ | 未实现 |

---

## 整体页面结构

| 路由 | 状态 | 说明 |
|------|------|------|
| / | ✅ | 已完成引导且已连钱包 → 直接进 /map + 欢迎回来；否则欢迎页或重定向 /onboarding |
| /onboarding | ✅ | 5 步流程，OnboardingGate 未完成时访问主功能会重定向到此 |
| /map | ✅ | 地图 + 欢迎回来条 + NavBar |
| /profile/:id | ✅ | 路由与页面有，内容可扩展 |
| /chat | ✅ | XMTP 对话列表 |
| /chat/:id | ✅ | XMTP 聊天详情 |
| /notifications | ⚠️ | 占位 |
| /settings | ✅ | 我：钱包、头像、昵称、性别、Soul、清除引导状态 |
| 底部导航 | ✅ | NavBar：地图、聊天、通知、我 |

---

## 动效与体验

| 项 | 状态 | 说明 |
|----|------|------|
| 按钮点击弹性 | ✅ | btn-elastic、btn-primary active:scale |
| Soul Card 弹跳入场 | ✅ | animate-bounce-in |
| 页面/卡片淡入 | ✅ | animate-fade-in-up、animate-float |
| 蘑菇待机/浮动 | ✅ | float 动画 |
| 霓虹连线/粒子 | ❌ | 未实现 |

---

## 建议优先级

1. **P0（可选补）**：地图附近人接 `/api/location/nearby`（后端控制器需先实现）
2. **P1（短期）**：他人 Profile 页内容、好友关系与请求、通知铃铛 + 列表骨架
3. **P2（中期）**：分享入口、「到Ta那里去」地图飞过去
4. **P3（体验）**：3D 蘑菇模型、霓虹连线、X402 咨询流程

---

*最后更新：按当前代码库与 PRD-当前代码拆解 整理。*
