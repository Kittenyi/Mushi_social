# Mushi - Web3 社交地图完整开发计划

## 🎨 设计风格
参考 Blink 的「可爱 + 酷炫」结合，想象一个充满 3D 软胶感、果冻色调的社交游乐场，所有交互都有弹性 Spring 动效。

---

## 📱 第一阶段：Onboarding 流程

**步骤 1: 欢迎页**
- Mushi Logo + 3D 蘑菇动画展示
- "Connect wallet" 按钮（弹性点击效果）

**步骤 2: 连接钱包**
- RainbowKit 钱包选择弹窗
- 支持 MetaMask、WalletConnect、Coinbase 等
- 连接成功后自动进入下一步

**步骤 3: 生成 Soul 形象**
- 根据钱包地址生成灵魂类型（Degen/Collector/Builder/Explorer）
- 显示蘑菇形象预览（颜色随类型变化）
- Soul Card 弹跳入场展示生成结果

**步骤 4: 设置个人资料**
- 输入昵称（Name）
- 选择头像：默认 蘑菇 或 上传自定义图片

**步骤 5: 开启 LBS**
- 请求定位权限
- 说明为何需要位置（显示附近好友）
- 用户可选择跳过

---

## 🗺️ 第二阶段：地图主界面

**地图显示**
- Mapbox 暗色主题地图
- 用户当前位置居中显示
- 自己的头像

**附近好友展示**
- 其他用户的头像分布在地图上
- 一句话状态气泡（类似「在喝咖啡 ☕」）

**交互效果**
- 点击任意位置 → 相机平滑移动
- 悬停头像 → 显示简要信息卡
- 信息卡展示操作按钮（都用图标表示）
- 陌生人：「Add Friend」+「Message」
- 已添加好友：「Message」+「Go to Their Location」

---

## 👤 第三阶段：Profile 页面

**点击蘑菇后展示**
- 全屏 Profile 弹窗（玻璃质感）
- 大头像展示
- 用户名 + Bio
- Soul 类型标签

**操作按钮（根据关系状态）**
- 陌生人：「Add Friend」+「Message」
- 已添加好友：「Message」+「Go to Their Location」

**「到Ta那里去」功能**
- 先在地图上平滑移动相机到好友位置
- 提供「使用外部地图导航」选项（打开 Google Maps/Apple Maps）

---

## 💬 第四阶段：聊天界面

**XMTP 加密聊天**
- 端到端加密的 P2P 消息
- 对话列表页面
- 聊天详情页面（消息气泡样式）

**聊天 UI**
- 顶部显示对方头像和名字
- 消息按时间排序
- 底部输入框 + 发送按钮
- 发送/接收消息有弹性动效

---

## 🔔 第五阶段：通知系统

**通知类型**
- 新好友请求
- 好友请求被通过
- 新消息提醒

**通知中心**
- 铃铛图标（有未读时显示红点）
- 下拉通知列表
- 每条通知可点击操作（接受/拒绝/查看）

**好友请求流程**
- A 向 B 发送请求 → B 收到通知
- B 可以接受或拒绝

---

## 📤 第六阶段：分享功能

**分享选项**
- 分享自己的 Profile 链接
- 分享当前位置
- 生成分享卡片（带二维码）

**分享渠道**
- 复制链接
- Twitter / X 分享
- 微信 / 其他社交平台

---

## 🎯 整体页面结构（与当前代码一致）

```
/                  → 欢迎页。未完成引导时重定向到 /onboarding；已完成且已连钱包时直接进 /map 并显示「欢迎回来」
/onboarding        → 5 步引导（欢迎 → wallet → soul → profile → lbs）
/onboarding/wallet → 连接钱包（RainbowKit）
/onboarding/soul   → Soul 形象（GET /api/soul/:address）
/onboarding/profile→ 昵称 + 头像
/onboarding/lbs    → 定位说明 + 请求权限 + 跳过 → 进 /map
/map               → 地图主界面（Mapbox）；顶部「欢迎回来」条（来自 / 跳转时）
/profile/:id       → 用户 Profile
/chat              → XMTP 对话列表
/chat/:id          → XMTP 聊天详情（id 为对方 0x 地址）
/notifications     → 通知中心（占位）
/settings          → 个人设置（我）：钱包、头像、昵称、性别、Soul、清除引导状态
```

- 未完成引导时访问 `/map`、`/chat`、`/notifications`、`/settings`、`/profile/:id` 会由 **OnboardingGate** 重定向到 `/onboarding`。

---

## ✨ 动效规范

- 所有按钮点击：缩小 0.95 → 弹回
- 弹窗入场：`spring({ stiffness: 300, damping: 20 })`
- 页面切换：淡入淡出 + 轻微位移
- 蘑菇待机：持续呼吸动画
- 霓虹连线：粒子流动效果

---

## 📁 项目结构预览（frontend/src）

```
src/
├── components/
│   ├── 3d/           # MushiScene（占位）
│   ├── chat/         # MessageBubble, ChatInput
│   ├── map/          # MapView, MapMarker, MyceliumLine, HeatLayer
│   ├── notifications/# NotificationBell, NotificationItem
│   ├── onboarding/   # WelcomeStep, ConnectWalletStep, SoulStep, ProfileStep, LBSStep, OnboardingShell, StepIndicator
│   ├── profile/      # ProfileCard
│   ├── layout/       # NavBar
│   ├── OnboardingGate.jsx  # 未完成引导时重定向到 /onboarding
│   └── ui/           # Button 等
├── context/         # XmtpContext, AuthContext, MapContext
├── hooks/            # useXmtpConversation, useWallet, useLocation, useH3, useMushiEvolution
├── lib/              # wagmi, soulApi, onboarding, xmtpSigner, mapbox
├── pages/            # 各页面
└── stores/          # useProfileStore, useAuthStore, useMapStore
```

详见 [FOLDER-STRUCTURE.md](./FOLDER-STRUCTURE.md)。
