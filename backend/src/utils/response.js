/**
 * 统一 API 响应格式（与前端约定一致，风格统一）
 * 所有接口返回 { success, data?, error?, message? }，JSON 字段 camelCase
 */

/**
 * 成功响应
 * @param {import('express').Response} res
 * @param {*} data - 业务数据（会放在 data 字段）
 * @param {number} [status=200]
 */
export function ok(res, data, status = 200) {
  return res.status(status).json({
    success: true,
    data: data ?? null,
  });
}

/**
 * 错误响应
 * @param {import('express').Response} res
 * @param {string} message - 错误信息
 * @param {number} [status=500]
 * @param {*} [error] - 可选，开发时可带详情
 */
export function err(res, message, status = 500, error = null) {
  const body = {
    success: false,
    message: message || 'Server Error',
  };
  if (error != null && process.env.NODE_ENV !== 'production') {
    body.error = error;
  }
  return res.status(status).json(body);
}

/**
 * 404
 */
export function notFound(res, message = 'Not found') {
  return err(res, message, 404);
}

/**
 * 400 参数错误
 */
export function badRequest(res, message = 'Bad request') {
  return err(res, message, 400);
}

/**
 * 401 未授权
 */
export function unauthorized(res, message = 'Unauthorized') {
  return err(res, message, 401);
}

/**
 * 403 无权限
 */
export function forbidden(res, message = 'Forbidden') {
  return err(res, message, 403);
}
