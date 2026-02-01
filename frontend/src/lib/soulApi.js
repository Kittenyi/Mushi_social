/**
 * Soul API：根据钱包地址拉取身份数据 + 标签
 * GET /api/soul/:address → { raw, tags }
 * 开发时：Vite 会把 /api 代理到 VITE_API_URL 或 localhost:5001，需后端已启动
 */
const API_BASE = import.meta.env.VITE_API_URL ?? '';
const FETCH_TIMEOUT_MS = 15000;

export async function fetchSoulByAddress(address) {
  if (!address) return null;
  const base = API_BASE || (import.meta.env.DEV ? '' : '');
  const url = `${base}/api/soul/${encodeURIComponent(address)}`.replace(/\/+/g, '/');
  const ac = new AbortController();
  const timeoutId = setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ac.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    clearTimeout(timeoutId);
    if (e?.name === 'AbortError') return null;
    throw e;
  }
}
