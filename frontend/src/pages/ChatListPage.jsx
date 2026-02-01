/**
 * 对话列表：/chat — 使用 @xmtp/browser-sdk 列出 DM
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { NavBar } from '../components/layout/NavBar';
import { useOptionalXmtpClient } from '../context/XmtpContext';

export function ChatListPage() {
  const navigate = useNavigate();
  const { address, isConnected, status } = useAccount();
  // 用 address 或 status 补充判断，避免 reconnecting 时误显示「请先连接钱包」
  const walletConnected = isConnected || !!address || status === 'reconnecting';
  const xmtp = useOptionalXmtpClient();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!xmtp?.client) {
      setConversations([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const { ConsentState } = await import('@xmtp/browser-sdk');
        const list = await xmtp.client.conversations.listDms({
          consentStates: ConsentState?.Allowed != null ? [ConsentState.Allowed] : ['allowed'],
        });
        if (!cancelled) setConversations(list ?? []);
      } catch {
        if (!cancelled) setConversations([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [xmtp?.client]);

  const peerAddress = (dm) => {
    try {
      const id = dm.peerAddress?.() ?? dm.peerAddress ?? dm.identifier?.identifier;
      return id ?? '';
    } catch {
      return '';
    }
  };

  const statusPill = xmtp?.isConnected
    ? 'XMTP 对话列表'
    : walletConnected
      ? '正在准备 XMTP…'
      : '连接钱包后显示';

  return (
    <div className="min-h-screen text-white flex flex-col pb-20 chat-page-bg">
      <header className="p-4 pt-safe chat-header-glow">
        <h1 className="text-xl font-semibold text-white">聊天</h1>
        <div className="mt-2">
          <span
            className={`chat-pill ${
              xmtp?.isConnected ? 'chat-pill-ok' : walletConnected ? 'chat-pill-loading' : 'chat-pill-loading'
            }`}
          >
            {xmtp?.isConnected && <span className="opacity-90">✨</span>}
            {!xmtp?.isConnected && walletConnected && <span className="inline-block w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />}
            {statusPill}
          </span>
        </div>
      </header>

      {!walletConnected && (
        <div className="flex-1 p-6 text-white/70 text-sm max-w-sm">
          <p>请先连接钱包，再在「聊天」或「Profile → 发消息」中与对方发起对话。</p>
        </div>
      )}

      {walletConnected && !xmtp?.isConnected && (
        <div className="flex-1 p-6 text-white/70 text-sm space-y-3 flex flex-col items-center justify-center">
          <div className="chat-pill chat-pill-loading mb-2">
            <span className="inline-block w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
            正在准备 XMTP…
          </div>
          {xmtp?.isLoading && <p>正在初始化 XMTP…</p>}
          {xmtp?.error && (
            <>
              <p className="text-rose-300/90">聊天初始化失败：{xmtp.error}</p>
              <p className="text-white/40 text-xs">可尝试刷新页面或断开钱包后重新连接。</p>
            </>
          )}
          {!xmtp?.error && !xmtp?.isLoading && <p className="text-white/50">请稍候…</p>}
        </div>
      )}

      {walletConnected && xmtp?.isConnected && loading && (
        <div className="flex-1 p-6 flex items-center justify-center">
          <span className="chat-pill chat-pill-loading">加载对话中…</span>
        </div>
      )}

      {walletConnected && xmtp?.isConnected && !loading && conversations.length === 0 && (
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
          <p className="text-4xl mb-3">🍄</p>
          <p className="text-white/70 text-sm">暂无对话</p>
          <p className="text-white/45 text-xs mt-1">从地图或 Profile 点「发消息」发起聊天</p>
        </div>
      )}

      {walletConnected && xmtp?.isConnected && !loading && conversations.length > 0 && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {conversations.map((dm) => {
            const addr = peerAddress(dm);
            return (
              <button
                key={addr || Math.random()}
                type="button"
                onClick={() => navigate(`/chat/${addr}`)}
                className="w-full flex items-center gap-3 p-4 chat-row-card text-left"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 flex items-center justify-center text-xl border border-white/10">
                  🍄
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-white">{addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '未知'}</p>
                  <p className="text-white/50 text-sm truncate">0x 地址 · 点击进入聊天</p>
                </div>
                <span className="text-white/30">→</span>
              </button>
            );
          })}
        </div>
      )}

      <NavBar />
    </div>
  );
}
