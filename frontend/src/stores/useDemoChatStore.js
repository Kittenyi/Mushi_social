/**
 * Demo chat store: local conversations + messages, no XMTP.
 * Persists to localStorage for hackathon demo — "Say hi!" always works.
 */
import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'mushi_demo_chat';

const MOCK_PEERS = [
  { address: '0x1111111111111111111111111111111111111111', name: 'Alex' },
  { address: '0x2222222222222222222222222222222222222222', name: 'Sam' },
  { address: '0x3333333333333333333333333333333333333333', name: 'Jade' },
];

function seedFor(peerNorm) {
  const oneHourAgo = Date.now() - 3600000;
  const twoHoursAgo = Date.now() - 7200000;
  if (peerNorm === '0x1111111111111111111111111111111111111111') {
    return [{ id: 's1', content: 'Hey! Coffee later? ☕', fromMe: false, sentAt: oneHourAgo }];
  }
  if (peerNorm === '0x2222222222222222222222222222222222222222') {
    return [
      { id: 's2', content: 'At Yellow Coworking today', fromMe: false, sentAt: twoHoursAgo },
      { id: 's3', content: 'Sure, see you there!', fromMe: true, sentAt: twoHoursAgo + 200000 },
    ];
  }
  if (peerNorm === '0x3333333333333333333333333333333333333333') return [];
  return [];
}

function normalizeAddress(addr) {
  if (!addr || typeof addr !== 'string') return '';
  return addr.toLowerCase().startsWith('0x') ? addr.toLowerCase() : `0x${addr}`;
}

function loadStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { messagesByPeer: {} };
    const data = JSON.parse(raw);
    const messagesByPeer = data.messagesByPeer || {};
    Object.keys(messagesByPeer).forEach((k) => {
      messagesByPeer[k] = (messagesByPeer[k] || []).map((m) => ({
        ...m,
        sentAt: typeof m.sentAt === 'number' ? m.sentAt : Date.now(),
      }));
    });
    return { messagesByPeer };
  } catch {
    return { messagesByPeer: {} };
  }
}

function saveStorage(messagesByPeer) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ messagesByPeer }));
  } catch (e) {
    console.warn('[DemoChat] save failed', e);
  }
}

function getPeerName(address) {
  const norm = normalizeAddress(address);
  const peer = MOCK_PEERS.find((p) => normalizeAddress(p.address) === norm);
  return peer ? peer.name : (norm ? `${norm.slice(0, 6)}…${norm.slice(-4)}` : 'Unknown');
}

export function useDemoChatStore() {
  const [data, setData] = useState(loadStorage);

  useEffect(() => {
    setData(loadStorage());
  }, []);

  const getMessages = useCallback((peerAddress) => {
    const norm = normalizeAddress(peerAddress);
    if (!norm) return [];
    const stored = loadStorage().messagesByPeer[norm] || [];
    const seed = seedFor(norm);
    const seedIds = new Set(seed.map((m) => m.id));
    const fromStorage = stored.filter((m) => !seedIds.has(m.id));
    const combined = [...seed, ...fromStorage].sort((a, b) => (a.sentAt || 0) - (b.sentAt || 0));
    return combined;
  }, []);

  const addMessage = useCallback((peerAddress, content, fromMe = true) => {
    const norm = normalizeAddress(peerAddress);
    if (!norm || !content?.trim()) return;
    const next = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      content: content.trim(),
      fromMe: !!fromMe,
      sentAt: Date.now(),
    };
    const state = loadStorage();
    const list = state.messagesByPeer[norm] || [];
    state.messagesByPeer[norm] = [...list, next];
    saveStorage(state.messagesByPeer);
    setData({ messagesByPeer: state.messagesByPeer });
  }, []);

  const getConversations = useCallback(() => {
    const state = loadStorage();
    const out = [];
    const seen = new Set();
    MOCK_PEERS.forEach((p) => {
      const norm = normalizeAddress(p.address);
      const list = state.messagesByPeer[norm] || [];
      const seed = seedFor(norm);
      const seedIds = new Set(seed.map((m) => m.id));
      const fromStorage = list.filter((m) => !seedIds.has(m.id));
      const all = [...seed, ...fromStorage].sort((a, b) => (a.sentAt || 0) - (b.sentAt || 0));
      const last = all[all.length - 1];
      seen.add(norm);
      out.push({
        peerAddress: p.address,
        peerName: p.name,
        lastMessage: last?.content || null,
        lastAt: last?.sentAt || null,
      });
    });
    Object.keys(state.messagesByPeer || {}).forEach((norm) => {
      if (seen.has(norm)) return;
      const list = state.messagesByPeer[norm] || [];
      const last = list[list.length - 1];
      if (!last) return;
      seen.add(norm);
      out.push({
        peerAddress: norm.startsWith('0x') ? norm : `0x${norm}`,
        peerName: getPeerName(norm),
        lastMessage: last.content,
        lastAt: last.sentAt,
      });
    });
    out.sort((a, b) => (b.lastAt || 0) - (a.lastAt || 0));
    return out;
  }, [data]);

  return {
    getMessages,
    addMessage,
    getConversations,
    getPeerName,
    MOCK_PEERS,
  };
}
