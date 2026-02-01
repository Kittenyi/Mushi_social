/**
 * Soul API：根据钱包地址拉取身份数据 + 标签
 * GET /api/soul/:address → { raw, tags }
 */
const API_BASE = import.meta.env.VITE_API_URL || '';
const FETCH_TIMEOUT_MS = 15000;

export async function fetchSoulByAddress(address) {
  if (!address) return null;
  const url = `${API_BASE}/api/soul/${encodeURIComponent(address)}`;
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
