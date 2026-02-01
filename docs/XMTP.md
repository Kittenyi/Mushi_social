# XMTP 聊天接入说明

前端使用 **@xmtp/browser-sdk**（官方推荐的 Browser SDK），并封装了 React Provider + Hooks，实现类似「React SDK」的用法。

---

## 1. 依赖与配置

- **package.json**：已添加 `@xmtp/browser-sdk`
- **vite.config.js**：已按 [官方说明](https://www.npmjs.com/package/@xmtp/browser-sdk) 配置 `optimizeDeps`（exclude wasm-bindings、browser-sdk，include proto）

安装依赖：

```bash
cd frontend && npm install
```

---

## 2. 结构

| 路径 | 说明 |
|------|------|
| **context/XmtpContext.jsx** | `XmtpProvider`、`useXmtpClient`、`useOptionalXmtpClient`；用 signer 创建 Client，保存 `myAddress` |
| **lib/xmtpSigner.js** | `createEoaSigner(address, signMessageAsync)`：把 wagmi/viem 的签名转成 XMTP 需要的 EOA Signer |
| **hooks/useXmtpConversation.js** | `useConversation(peerAddress)`、`useMessages(dm)`、`useSendMessage(dm)` |
| **pages/ChatDetailPage.jsx** | 聊天详情：id 为对方 **0x 地址**时走 XMTP，拉消息、发消息 |
| **pages/ChatListPage.jsx** | 对话列表：`client.conversations.listDms()` |

---

## 3. 连接钱包 → 初始化 XMTP（已实现）

当前 `App.jsx` 已接入 RainbowKit/wagmi：

1. 用 **useAccount** + **useWalletClient**（wagmi）拿到 `address` 和 `walletClient`
2. 用 **createEoaSigner(address, signMessageAsync)**（`lib/xmtpSigner.js`）得到 EOA signer（仅依赖 `address` + `isConnected`，避免 walletClient 引用变化导致重复创建）
3. 把 signer 传给 **XmtpProvider**；Provider 内当 `signer` 存在且尚未连接时自动调用 **connect(signer)** 创建 XMTP Client

未连接钱包时：聊天页会提示「请先连接钱包以使用 XMTP」。

---

## 4. 聊天入口

- **对话列表** `/chat`：连接 XMTP 后显示 `listDms()` 的会话；点击某条进入 `/chat/:address`
- **聊天详情** `/chat/:id`：**id 必须为对方 0x 地址** 才会拉会话、发消息；否则只显示占位
- 从 **Profile** 点「Message」跳转到 `/chat/:id` 时，若后端/路由能提供对方 **0x 地址**，把 id 设为该地址即可

---

## 5. 参考

- [XMTP Browser SDK](https://docs.xmtp.org/chat-apps/sdks/browser)
- [Create client / Signer](https://docs.xmtp.org/chat-apps/core-messaging/create-a-client)
- [Create conversations / fetchDmByIdentifier](https://docs.xmtp.org/chat-apps/core-messaging/create-conversations)
- [Send messages](https://docs.xmtp.org/chat-apps/core-messaging/send-messages)
