/**
 * 单条通知：标题、正文、时间、类型（好友申请 / 活动）及操作
 */
import { motion } from 'framer-motion';

const spring = { stiffness: 300, damping: 22 };

export function NotificationItem({ id, type, title, body, time, read, onAccept, onDismiss, onPress }) {
  const isFriendRequest = type === 'friend_request';
  const isEvent = type === 'event';

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className={`rounded-2xl border p-4 mb-3 text-left transition-colors ${
        read ? 'opacity-70' : ''
      }`}
      style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(12px)',
        borderColor: 'rgba(255,255,255,0.08)',
      }}
    >
      <button
        type="button"
        className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl"
        onClick={() => onPress?.(id)}
      >
        <div className="flex items-start gap-3">
          <span
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{
              background: isFriendRequest ? 'rgba(163, 255, 18, 0.15)' : 'rgba(139, 92, 246, 0.15)',
              color: isFriendRequest ? '#A3FF12' : '#8B5CF6',
            }}
            aria-hidden
          >
            {isFriendRequest ? '👋' : '✨'}
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white mb-0.5">{title}</h3>
            <p className="text-xs text-white/60 leading-relaxed">{body}</p>
            <p className="text-xs text-white/40 mt-2">{time}</p>
          </div>
        </div>
      </button>
      {isFriendRequest && (onAccept || onDismiss) && (
        <div className="flex gap-2 mt-3 pl-12">
          {onAccept && (
            <motion.button
              type="button"
              onClick={(e) => { e.stopPropagation(); onAccept(id); }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary/20 text-primary border border-primary/40"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={spring}
            >
              Accept
            </motion.button>
          )}
          {onDismiss && (
            <motion.button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDismiss(id); }}
              className="px-4 py-2 rounded-xl text-xs font-medium text-white/50 hover:text-white/80 hover:bg-white/5"
              whileTap={{ scale: 0.98 }}
              transition={spring}
            >
              Ignore
            </motion.button>
          )}
        </div>
      )}
    </motion.article>
  );
}
