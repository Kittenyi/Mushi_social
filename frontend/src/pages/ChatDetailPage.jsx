/**
 * 聊天详情：/chat/:id — 使用 @xmtp/browser-sdk 收发消息
 * id 为对方 0x 地址时走 XMTP；否则显示占位
 */
import { useParams, useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import { NavBar } from '../components/layout/NavBar';
import { useOptionalXmtpClient } from '../context/XmtpContext';
import { useConversation, useMessages, useSendMessage } from '../hooks/useXmtpConversation';

function ChatDetailContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [input, setInput] = useState('');
  const { address, isConnected, status } = useAccount();
  const walletConnected = isConnected || !!address || status === 'reconnecting';
  const xmtp = useOptionalXmtpClient();
  const isPeerAddress = id?.startsWith('0x');
  const { dm, isLoading: convLoading, error: convError } = useConversation(isPeerAddress ? id : null);
  const { messages, isLoading: msgLoading } = useMessages(dm);
  const { sendMessage, sending, error: sendError } = useSendMessage(dm);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');
    const ok = await sendMessage(text);
    if (!ok && sendError) inputRef.current?.focus();
  };

  const loading = convLoading || msgLoading;
  const myAddress = xmtp?.myAddress ?? '';

  return (
    <div className="min-h-screen text-white flex flex-col pb-20 chat-page-bg">
      <header className="flex items-center gap-3 p-4 pt-safe chat-header-glow">
        <button
          type="button"
          onClick={() => navigate('/chat')}
          className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/15 text-white/90 flex items-center justify-center transition-colors"
        >
          ←
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 flex items-center justify-center text-xl border border-white/10">
          🍄
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate text-white">
            {isPeerAddress ? `${id.slice(0, 6)}...${id.slice(-4)}` : `用户 ${id}`}
          </p>
          <div className="mt-0.5">
            {!xmtp?.isConnected && !walletConnected && (
              <span className="chat-pill chat-pill-loading text-xs">请先连接钱包</span>
            )}
            {!xmtp?.isConnected && walletConnected && (
              <span className="chat-pill chat-pill-loading text-xs">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse mr-1" />
                正在准备 XMTP…
              </span>
            )}
            {xmtp?.isConnected && !isPeerAddress && (
              <span className="text-white/50 text-xs">从地图或对方主页点击「发消息」即可开始聊天</span>
            )}
            {xmtp?.isConnected && isPeerAddress && (
              <span className={convError ? 'text-rose-300/80 text-xs' : 'chat-pill chat-pill-ok text-xs'}>
                {convError || 'XMTP 端到端加密'}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!xmtp?.isConnected && !walletConnected && (
          <p className="text-white/50 text-sm">连接钱包后在此与对方收发消息</p>
        )}
        {!xmtp?.isConnected && walletConnected && (
          <div className="flex flex-col items-center justify-center py-12">
            <span className="chat-pill chat-pill-loading mb-2">
              <span className="inline-block w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
              正在准备 XMTP，请稍候…
            </span>
            <p className="text-white/45 text-sm mt-2">首次使用需在钱包中签名以启用加密聊天</p>
          </div>
        )}
        {xmtp?.isConnected && isPeerAddress && !dm && loading && (
          <p className="text-white/40 text-sm">加载会话中...</p>
        )}
        {xmtp?.isConnected && isPeerAddress && dm && messages.length === 0 && !loading && (
          <p className="text-white/40 text-sm">暂无消息，发一条打个招呼吧</p>
        )}
        {xmtp?.isConnected && isPeerAddress && dm && messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.senderAddress?.toLowerCase() === myAddress?.toLowerCase() ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                m.senderAddress?.toLowerCase() === myAddress?.toLowerCase()
                  ? 'chat-btn-gradient'
                  : 'bg-white/10 border border-white/10'
              }`}
            >
              <p className="text-sm text-white/90 break-words">{m.content}</p>
              <p className="text-xs text-white/40 mt-1">
                {m.sentAt instanceof Date ? m.sentAt.toLocaleTimeString() : ''}
              </p>
            </div>
          </div>
        ))}
      </div>

      {xmtp?.isConnected && isPeerAddress && dm && (
        <div className="px-4 py-3 border-t border-white/10 flex gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="输入消息..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            className="flex-1 px-4 py-3 rounded-2xl bg-white/10 border border-white/10 text-white placeholder:text-white/40 outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="px-5 py-3 rounded-2xl chat-btn-gradient font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? '...' : '发送'}
          </button>
        </div>
      )}

      {(!xmtp?.isConnected || !isPeerAddress) && (
        <div className="px-4 py-4 border-t border-white/10 space-y-3">
          <p className="text-white/45 text-sm text-center">
            {!xmtp?.isConnected && !walletConnected && '连接钱包后，从「聊天」列表进入对话或从地图/主页点「发消息」'}
            {!xmtp?.isConnected && walletConnected && '正在准备 XMTP，请稍候…'}
            {xmtp?.isConnected && !isPeerAddress && '从地图点对方头像 → 主页点「发消息」，或从「聊天」列表进入已有对话'}
          </p>
          <button
            type="button"
            onClick={() => navigate('/chat')}
            className="w-full py-3.5 rounded-2xl chat-btn-gradient text-sm font-medium"
          >
            返回对话列表
          </button>
        </div>
      )}

      <NavBar />
    </div>
  );
}

export function ChatDetailPage() {
  return <ChatDetailContent />;
}
