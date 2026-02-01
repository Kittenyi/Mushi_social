/**
 * 中心化聊天 API：REST 请求后端，钱包地址作为用户标识
 * 开发时 Vite 代理 /api -> 后端，可不设 VITE_API_URL；生产需设 VITE_API_URL
 */
function getBase() {
  const url = import.meta.env.VITE_API_URL || '';
  return url.replace(/\/api\/?$/, '').trim() || '';
}

function apiUrl(path) {
  const base = getBase();
  const p = path.startsWith('/') ? path : `/${path}`;
  if (base) return `${base}/api/chat${p}`;
  return `/api/chat${p}`;
}

export async function getMessages(me, peer) {
  if (!me || !peer) return [];
  const params = new URLSearchParams({ me: me.toLowerCase(), peer: peer.toLowerCase() });
  const res = await fetch(apiUrl(`/messages?${params}`));
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function sendMessage(from, to, content) {
  if (!from || !to || !content?.trim()) throw new Error('Missing from, to or content');
  const res = await fetch(apiUrl('/messages'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: from.toLowerCase(),
      to: to.toLowerCase(),
      content: content.trim(),
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getConversations(me) {
  if (!me) return [];
  const params = new URLSearchParams({ me: me.toLowerCase() });
  const res = await fetch(apiUrl(`/conversations?${params}`));
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
