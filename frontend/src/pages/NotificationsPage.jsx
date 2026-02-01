/**
 * Notification Center: /notifications — friend requests, events & system messages (all copy in English)
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { NavBar } from '../components/layout/NavBar';
import { NotificationItem } from '../components/notifications/NotificationItem';
import { addAcceptedFriend, SHERRY_ID, SHERRY_ADDRESS } from '../lib/friendsData';

const MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'friend_request',
    fromName: 'Sherry',
    fromId: SHERRY_ID,
    peerAddress: SHERRY_ADDRESS,
    title: 'Sherry sent you a friend request',
    body: 'Sherry wants to add you as a friend to explore more together.',
    time: 'Today 14:32',
    read: false,
  },
  {
    id: 'n2',
    type: 'event',
    title: 'Shambhala 2026 · Chiang Mai Opening',
    body: 'Inspiration, art & connection — Shambhala Art Festival 2026 Chiang Mai is about to open. Meet creators from around the world and embark on a journey of possibilities between forest and ancient city.',
    time: 'Feb 1',
    read: false,
  },
  {
    id: 'n3',
    type: 'system',
    title: 'Welcome to Mushi',
    body: "You've connected your wallet and completed Soul discovery. You can now discover nearby mushrooms on the map, start chats, or join events.",
    time: 'Yesterday',
    read: true,
  },
];

export function NotificationsPage() {
  const navigate = useNavigate();
  const [list, setList] = useState(MOCK_NOTIFICATIONS);
  const [addSuccessToast, setAddSuccessToast] = useState(null);

  const handleAccept = (id) => {
    const item = list.find((n) => n.id === id);
    const name = item?.fromName || item?.title?.split(' ')[0] || 'them';
    const fromId = item?.fromId;
    const peerAddress = item?.peerAddress;
    if (fromId) addAcceptedFriend(fromId);
    setList((prev) => prev.filter((n) => n.id !== id));
    setAddSuccessToast(name);
    setTimeout(() => setAddSuccessToast(null), 2500);
    setTimeout(() => {
      navigate('/friends', { state: peerAddress ? { openChatFor: fromId, peerAddress } : undefined });
    }, 1800);
  };

  const handleDismiss = (id) => {
    setList((prev) => prev.filter((n) => n.id !== id));
  };

  const handlePress = (id) => {
    const n = list.find((x) => x.id === id);
    if (n?.type === 'friend_request') return;
    if (n?.type === 'event') {
      setList((prev) => prev.map((x) => (x.id === id ? { ...x, read: true } : x)));
    }
  };

  return (
    <div
      className="flex min-h-screen flex-col pb-nav"
      style={{
        background: 'linear-gradient(165deg, #0f0f1a 0%, #1a1a2e 40%, #16213e 100%)',
      }}
    >
      <header className="p-4 pt-safe">
        <h1 className="text-2xl font-semibold text-white tracking-wide">Notification Center</h1>
        <p className="text-sm text-white/50 mt-1">Friend requests, events & system messages</p>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-white/50 text-sm">No new notifications</p>
            <p className="text-white/30 text-xs mt-1">Friend requests and event updates will appear here</p>
          </div>
        ) : (
          list.map((n) => (
            <NotificationItem
              key={n.id}
              id={n.id}
              type={n.type}
              title={n.title}
              body={n.body}
              time={n.time}
              read={n.read}
              onAccept={n.type === 'friend_request' ? handleAccept : undefined}
              onDismiss={n.type === 'friend_request' ? handleDismiss : undefined}
              onPress={handlePress}
            />
          ))
        )}
      </div>

      <AnimatePresence>
        {addSuccessToast && (
          <motion.div
            className="fixed left-4 right-4 bottom-20 z-30 mx-auto max-w-sm rounded-2xl border px-4 py-3 text-center shadow-lg"
            style={{
              background: 'rgba(20, 20, 30, 0.95)',
              backdropFilter: 'blur(20px)',
              borderColor: 'rgba(163, 255, 18, 0.35)',
              boxShadow: '0 0 24px rgba(163, 255, 18, 0.15)',
            }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ type: 'tween', duration: 0.25 }}
          >
            <p className="text-sm font-medium text-white">You have added {addSuccessToast}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <NavBar />
    </div>
  );
}
