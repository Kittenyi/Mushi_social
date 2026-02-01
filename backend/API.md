# Mushi Backend API 风格说明

与前端统一的接口约定，避免「后端土、前端潮」割裂感。

## 响应格式

- **成功**：`{ success: true, data: T }`
- **失败**：`{ success: false, message: string }`
- 字段一律 **camelCase**，与前端一致。

## 路由与前端对应

| 后端路由 | 说明 | 前端使用 |
|---------|------|----------|
| `GET /api/health` | 健康检查 | 探活 |
| `GET /api/soul/:address` | Soul 身份标签 | Onboarding Soul、设置页 |
| `GET /api/users/:id` | 用户资料 | Profile 页 |
| `PUT /api/users/:id` | 更新资料 | 设置页 |
| `POST /api/auth/*` | 登录/注册 | 可选（当前以钱包为主） |
| `GET/POST /api/location/*` | 位置快照 | 地图附近的人 |
| `GET/POST /api/chat/*` | 聊天 + Socket.io | 对话列表、聊天详情 |
| `GET /api/posts/*` | 动态 | 后续社交 |

## 使用 response 工具

在 controller 中统一用 `utils/response.js`：

```js
import { ok, err, badRequest, notFound } from '../utils/response.js';

export async function getSoulByAddress(req, res) {
  try {
    const { address } = req.params;
    if (!address) return badRequest(res, 'Missing address');

    const raw = await getRawIdentityData(address);
    const tags = classifySoul(raw ?? fallbackRaw);

    return ok(res, { address, raw, tags });
  } catch (e) {
    return err(res, e.message, 500, e);
  }
}
```

## 错误处理

- 业务错误：`badRequest(res, 'xxx')`、`notFound(res)`、`forbidden(res)` 等。
- 未捕获异常：`server.js` 中统一 `err(res, message, 500)`，生产环境不暴露堆栈。
