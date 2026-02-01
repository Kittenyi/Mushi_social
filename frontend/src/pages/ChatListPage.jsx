/**
 * 对话列表：/chat — 中心化实时聊天，连接钱包后拉取会话列表，含演示用 Alex/Sam/Jade
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar } from '../components/layout/NavBar';
import { useRealtimeChat } from '../context/RealtimeChatContext';

function normalizeAddress(addr) {
  if (!addr || typeof addr !== 'string') return '';
  return addr.toLowerCase().startsWith('0x') ? addr.toLowerCase() : addr.toLowerCase();
}

export function ChatListPage() {
  const navigate = useNavigate();
  const { myAddress, isReady, conversations, loadConversations, getPeerName, MOCK_PEERS } = useRealtimeChat();
  const [list, setList] = useState([]);

  useEffect(() => {
    if (!isReady || !myAddress) {
      setList(MOCK_PEERS.map((p) => ({ peerAddress: p.address, peerName: p.name, lastMessage: null, lastAt: null })));
      return;
    }
    loadConversations().then((convos) => {
      const seen = new Set(convos.map((c) => normalizeAddress(c.peerAddress)));
      const merged = [...convos.map((c) => ({ ...c, peerName: c.peerName || getPeerName(c.peerAddress) }))];
      MOCK_PEERS.forEach((p) => {
        if (seen.has(normalizeAddress(p.address))) return;
        seen.add(normalizeAddress(p.address));
        merged.push({ peerAddress: p.address, peerName: p.name, lastMessage: null, lastAt: null });
      });
      merged.sort((a, b) => (b.lastAt ? new Date(b.lastAt).getTime() : 0) - (a.lastAt ? new Date(a.lastAt).getTime() : 0));
      setList(merged);
    });
  }, [isReady, myAddress, loadConversations, getPeerName, MOCK_PEERS]);

  const displayList = list.length > 0 ? list : MOCK_PEERS.map((p) => ({ peerAddress: p.address, peerName: p.name, lastMessage: null, lastAt: null }));

  return (
    <div className="flex min-h-screen flex-col bg-background pb-nav chat-page-bg">
      <header className="flex items-center gap-3 p-4 pt-safe chat-header-glow">
        <button
          type="button"
          onClick={() => navigate('/map')}
          className="touch-target w-11 h-11 rounded-xl bg-white/10 hover:bg-white/15 flex items-center justify-center text-xl shrink-0"
          aria-label="Back to map"
        >
          ←
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="mb-4 text-4xl font-bold">Chat</h1>
          <p className="text-xl text-muted-foreground">
            {isReady ? 'Real-time · Connected' : 'Connect wallet to chat'}
          </p>
        </div>
      </header>

      {!isReady && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-xl text-muted-foreground">Connect your wallet first.</p>
            <p className="text-muted-foreground mt-2">After connecting, you can send and receive messages in real time.</p>
          </div>
        </div>
      )}

      {isReady && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {displayList.map((c) => (
            <button
              key={c.peerAddress}
              type="button"
              onClick={() => navigate(`/chat/${c.peerAddress}`)}
              className="w-full flex items-center gap-3 p-4 chat-row-card text-left"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 flex items-center justify-center text-xl border border-white/10">
                🍄
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-foreground">{c.peerName}</p>
                <p className="text-muted-foreground text-sm truncate">
                  {c.lastMessage || 'Tap to say hi'}
                </p>
              </div>
              <span className="text-white/30">→</span>
            </button>
          ))}
        </div>
      )}

      <NavBar />
    </div>
  );
}
