/**
 * 中心化实时聊天：连接钱包后注册地址，通过 Socket.io 收新消息，REST 拉历史与发送
 */
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import * as chatApi from '../lib/chatApi';

const RealtimeChatContext = createContext(null);

const MOCK_PEERS = [
  { address: '0x1111111111111111111111111111111111111111', name: 'Alex' },
  { address: '0x2222222222222222222222222222222222222222', name: 'Sam' },
  { address: '0x3333333333333333333333333333333333333333', name: 'Jade' },
];

function normalizeAddress(addr) {
  if (!addr || typeof addr !== 'string') return '';
  return addr.toLowerCase().startsWith('0x') ? addr.toLowerCase() : addr.toLowerCase();
}

export function useRealtimeChat() {
  const ctx = useContext(RealtimeChatContext);
  if (!ctx) throw new Error('useRealtimeChat must be used within RealtimeChatProvider');
  return ctx;
}

export function RealtimeChatProvider({ myAddress, children }) {
  const { pathname } = useLocation();
  const [messagesByPeer, setMessagesByPeer] = useState({});
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);
  const myNorm = normalizeAddress(myAddress);

  // 仅在进入聊天相关页面时建立 Socket，避免地图页等触发 WebSocket 报错
  const needSocket = pathname === '/chat' || pathname.startsWith('/chat/');

  useEffect(() => {
    if (!myNorm || !needSocket) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (!myNorm) {
        setConversations([]);
        setMessagesByPeer({});
      }
      return;
    }

    const url = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    const wsBase = url.replace(/\/api\/?$/, '').trim() || 'http://localhost:5001';
    const socket = io(wsBase, {
      transports: ['polling', 'websocket'],
      withCredentials: true,
      reconnectionAttempts: 2,
      reconnectionDelay: 3000,
    });
    socketRef.current = socket;

    let connectErrorLogged = false;
    socket.on('connect_error', () => {
      if (!connectErrorLogged && import.meta.env.DEV) {
        connectErrorLogged = true;
        console.warn('[RealtimeChat] Backend not available at', wsBase, '- chat will work when backend runs.');
      }
    });
    socket.on('connect', () => {
      socket.emit('register', { address: myNorm });
    });

    socket.on('new_message', (msg) => {
      const peer = msg.from === myNorm ? msg.to : msg.from;
      setMessagesByPeer((prev) => ({
        ...prev,
        [peer]: [...(prev[peer] || []), { ...msg, fromMe: msg.from === myNorm }],
      }));
      setConversations((prev) => {
        const next = prev.filter((c) => normalizeAddress(c.peerAddress) !== peer);
        return [{ peerAddress: peer.startsWith('0x') ? peer : `0x${peer}`, lastMessage: msg.content, lastAt: msg.sentAt }, ...next];
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [myNorm, needSocket]);

  const loadMessages = useCallback(
    async (peer) => {
      if (!myNorm || !peer) return [];
      const norm = normalizeAddress(peer);
      setLoading(true);
      try {
        const list = await chatApi.getMessages(myAddress, peer);
        const mapped = list.map((m) => ({
          ...m,
          fromMe: m.from === myNorm,
          sentAt: m.sentAt ? new Date(m.sentAt) : null,
        }));
        setMessagesByPeer((prev) => ({ ...prev, [norm]: mapped }));
        return mapped;
      } catch (e) {
        console.error('[RealtimeChat] loadMessages failed', e);
        return messagesByPeer[norm] || [];
      } finally {
        setLoading(false);
      }
    },
    [myAddress, myNorm]
  );

  const sendMessage = useCallback(
    async (peer, content) => {
      if (!myNorm || !peer || !content?.trim()) return null;
      const norm = normalizeAddress(peer);
      const trimmed = content.trim();
      // Optimistic: show message immediately so "Send" always appears to work
      const optimisticId = `opt_${Date.now()}`;
      const optimisticMsg = { id: optimisticId, from: myNorm, to: norm, content: trimmed, fromMe: true, sentAt: new Date() };
      setMessagesByPeer((prev) => ({
        ...prev,
        [norm]: [...(prev[norm] || []), optimisticMsg],
      }));
      setConversations((prev) => {
        const rest = prev.filter((c) => normalizeAddress(c.peerAddress) !== norm);
        return [{ peerAddress: norm.startsWith('0x') ? norm : `0x${norm}`, lastMessage: trimmed, lastAt: optimisticMsg.sentAt }, ...rest];
      });
      try {
        const msg = await chatApi.sendMessage(myAddress, peer, trimmed);
        const out = { ...msg, fromMe: true, sentAt: msg.sentAt ? new Date(msg.sentAt) : new Date() };
        setMessagesByPeer((prev) => ({
          ...prev,
          [norm]: (prev[norm] || []).map((m) => (m.id === optimisticId ? out : m)),
        }));
        return out;
      } catch (e) {
        console.error('[RealtimeChat] sendMessage failed', e);
        return { ...optimisticMsg, failed: true };
      }
    },
    [myAddress, myNorm]
  );

  const loadConversations = useCallback(async () => {
    if (!myNorm) return [];
    try {
      const list = await chatApi.getConversations(myAddress);
      const withNames = list.map((c) => ({
        ...c,
        peerName: MOCK_PEERS.find((p) => normalizeAddress(p.address) === normalizeAddress(c.peerAddress))?.name || c.peerAddress?.slice(0, 10) + '…',
      }));
      setConversations(withNames);
      return withNames;
    } catch (e) {
      console.error('[RealtimeChat] loadConversations failed', e);
      return [];
    }
  }, [myAddress, myNorm]);

  const getMessagesForPeer = useCallback(
    (peer) => {
      if (!peer) return [];
      return messagesByPeer[normalizeAddress(peer)] || [];
    },
    [messagesByPeer]
  );

  const getPeerName = useCallback((address) => {
    const norm = normalizeAddress(address);
    const p = MOCK_PEERS.find((x) => normalizeAddress(x.address) === norm);
    return p ? p.name : (norm ? `${norm.slice(0, 6)}…${norm.slice(-4)}` : 'Unknown');
  }, []);

  const value = {
    myAddress: myAddress || null,
    isReady: !!myNorm,
    conversations,
    loadConversations,
    loadMessages,
    sendMessage,
    getMessagesForPeer,
    getPeerName,
    loading,
    MOCK_PEERS,
  };

  return (
    <RealtimeChatContext.Provider value={value}>
      {children}
    </RealtimeChatContext.Provider>
  );
}
