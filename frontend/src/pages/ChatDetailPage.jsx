/**
 * 聊天详情：/chat/:id — 中心化实时聊天，连接钱包后收发消息，新消息通过 Socket 推送
 */
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { NavBar } from '../components/layout/NavBar';
import { useRealtimeChat } from '../context/RealtimeChatContext';

export function ChatDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const peerAddress = id?.startsWith('0x') ? id : id ? `0x${id}` : '';
  const { myAddress, isReady, getMessagesForPeer, loadMessages, sendMessage, getPeerName } = useRealtimeChat();

  const messages = getMessagesForPeer(peerAddress);
  const peerName = location.state?.peerName || getPeerName(peerAddress);

  useEffect(() => {
    if (!peerAddress || !isReady) return;
    loadMessages(peerAddress);
  }, [peerAddress, isReady, loadMessages]);

  useEffect(() => {
    listRef.current?.scrollTo?.({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async () => {
    if (!input.trim() || !peerAddress || !isReady || sending) return;
    const text = input.trim();
    setSending(true);
    try {
      await sendMessage(peerAddress, text);
      setInput('');
      inputRef.current?.focus();
    } catch (e) {
      console.error('Send failed', e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background pb-nav chat-page-bg">
      <header className="flex items-center gap-3 p-4 pt-safe chat-header-glow">
        <button
          type="button"
          onClick={() => navigate('/chat')}
          className="touch-target w-11 h-11 rounded-xl bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors"
          aria-label="Back to chat list"
        >
          ←
        </button>
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl border border-white/10">
          🍄
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="mb-0 text-2xl font-serif font-light tracking-tight truncate text-foreground">{peerName}</h1>
        </div>
      </header>

      <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {!isReady && (
          <div className="text-center">
            <h2 className="mb-4 text-4xl font-bold">Connect Wallet</h2>
            <p className="text-xl text-muted-foreground">Connect your wallet to send and receive messages here.</p>
          </div>
        )}
        {isReady && !peerAddress && (
          <div className="text-center">
            <h2 className="mb-4 text-4xl font-bold">Open a chat</h2>
            <p className="text-xl text-muted-foreground">Open a chat from the list or Profile → Say hi!</p>
          </div>
        )}
        {isReady && peerAddress && messages.length === 0 && (
          <div className="text-center">
            <h2 className="mb-4 text-4xl font-bold">No messages yet</h2>
            <p className="text-xl text-muted-foreground">Say hi!</p>
          </div>
        )}
        {isReady && peerAddress && messages.length > 0 && messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.fromMe ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                m.fromMe ? 'chat-btn-gradient' : 'bg-white/10 border border-white/10'
              }`}
            >
              <p className="text-sm text-white/90 break-words">{m.content}</p>
              <p className="text-xs text-white/40 mt-1">
                {m.sentAt ? new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </p>
            </div>
          </div>
        ))}
      </div>

      {isReady && peerAddress && (
        <div className="px-4 py-3 border-t border-white/10 flex gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            className="flex-1 px-4 py-3 rounded-2xl bg-white/10 border border-white/10 text-foreground placeholder:text-muted-foreground outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="px-5 py-3 rounded-2xl chat-btn-gradient font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? '...' : 'Send'}
          </button>
        </div>
      )}

      {(!isReady || !peerAddress) && (
        <div className="px-4 py-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => navigate('/chat')}
            className="w-full py-3.5 rounded-2xl chat-btn-gradient text-sm font-medium"
          >
            Back to Chat
          </button>
        </div>
      )}

      <NavBar />
    </div>
  );
}
