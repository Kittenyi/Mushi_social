# Mushi PRD 路由与设计对齐

## 页面结构（与 PRD 一致）

| 路径 | 说明 |
|------|------|
| `/` | 欢迎页（未登录）或 重定向到地图（已登录） |
| `/onboarding` | Onboarding 流程：先连接钱包 → 扫码 → 结果 |
| `/onboarding/result` | Onboarding 结果页（昵称/性别/兴趣） |
| `/map` | 地图主界面 |
| `/profile/:id` | 用户 Profile |
| `/chat` | 对话列表 |
| `/chat/:id` | 聊天详情 |
| `/notifications` | 通知中心 |
| `/settings` | 个人设置 |

## 设计风格（PRD：可爱 + 酷炫）

- **参考**：Blink 的「可爱 + 酷炫」、3D 软胶感、果冻色调
- **动效**：`frontend/src/lib/motion.js` 统一 Spring（stiffness 300, damping 20）
  - 按钮点击：缩小 0.95 → 弹回
  - 弹窗入场：spring 弹跳
  - 页面切换：淡入淡出 + 轻微位移
- **主题**：`frontend/src/styles/index.css` 霓虹绿/紫、深色森林

## 前后端风格统一

- **后端**：`backend/API.md` + `backend/src/utils/response.js`
  - 响应格式：`{ success, data? }` / `{ success: false, message }`
  - 字段 camelCase
- **前端**：调用 API 时取 `response.data`（若为 envelope 格式）

## 项目结构（PRD 预览）

```
src/
├── components/
│   ├── 3d/           # 蘑菇、连线、地图场景
│   ├── chat/         # 聊天相关
│   ├── map/          # 地图组件
│   ├── notifications/# 通知组件
│   ├── onboarding/   # Onboarding 步骤
│   ├── profile/      # Profile 组件
│   └── ui/           # 通用 UI
├── hooks/
├── pages/
├── lib/              # 工具、XMTP、motion 常量
└── stores/
```
