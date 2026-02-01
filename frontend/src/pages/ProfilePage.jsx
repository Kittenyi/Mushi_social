/**
 * 用户 Profile 页 - 与 Onboarding 统一的「可爱+酷」风格：
 * 渐变背景、玻璃卡片、Soul 色光晕、弹性动效、2x2 功能格清晰分离
 * Add friend 底部弹窗；每个蘑菇的 Friends / Activity 独立设计
 */
import { useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UsersRound, Activity, Star, MapPin } from 'lucide-react';
import { NavBar } from '../components/layout/NavBar';
import { MOCK_USERS, SOUL_COLORS, defaultSoul, shortId, handleFromName } from '../lib/profileData';

const springConfig = { stiffness: 300, damping: 22 };

export function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = MOCK_USERS[id] || { name: 'Unknown', address: null, bio: '', soulType: 'Degen', status: '', isFriend: false, tags: [], following: 0, followers: 0, activityCount: 0, activityLabel: 'Activity' };
  const chatAddress = location.state?.address ?? user.address;
  const soul = SOUL_COLORS[user.soulType] || defaultSoul;
  const [showAddFriendToast, setShowAddFriendToast] = useState(false);

  const handleAddFriend = () => {
    setShowAddFriendToast(true);
    setTimeout(() => setShowAddFriendToast(false), 2500);
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col pb-nav"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      style={{
        background: 'linear-gradient(165deg, #0f0f1a 0%, #1a1a2e 40%, #16213e 100%)',
      }}
    >
      {/* 顶栏：玻璃质感 */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 mx-4 mt-2 rounded-2xl border"
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
          borderColor: 'rgba(255,255,255,0.08)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
        }}
      >
        <motion.button
          type="button"
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white/90 hover:bg-white/10"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={springConfig}
          aria-label="Back"
        >
          ←
        </motion.button>
        <span className="text-sm font-medium text-white/90 tracking-wide truncate max-w-[140px]">
          {handleFromName(user.name)}
        </span>
        <div className="flex items-center gap-1">
          <motion.button type="button" className="w-10 h-10 rounded-xl flex items-center justify-center text-white/70 hover:bg-white/10" whileTap={{ scale: 0.9 }} aria-label="Notifications">🔔</motion.button>
          <motion.button type="button" className="w-10 h-10 rounded-xl flex items-center justify-center text-white/70 hover:bg-white/10" whileTap={{ scale: 0.9 }} aria-label="Menu">⋯</motion.button>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center px-5 pb-8 overflow-y-auto">
        {/* 统计：Following | Friends 玻璃胶囊 */}
        <motion.div
          className="flex items-center gap-6 px-6 py-3 rounded-full border mt-4 mb-2"
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(12px)',
            borderColor: `${soul.primary}30`,
            boxShadow: `0 0 20px ${soul.glow}`,
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, ...springConfig }}
        >
          <span className="text-sm text-white/80">
            <strong className="text-white font-semibold">{user.following ?? 0}</strong> Following
          </span>
          <span className="text-sm text-white/80">
            <strong className="text-white font-semibold">{user.followers ?? 0}</strong> Friends
          </span>
        </motion.div>

        {/* 头像 + Soul 光晕 */}
        <motion.div
          className="relative mt-2 mb-3"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.12, ...springConfig }}
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-4xl border-2"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${soul.primary}40, rgba(0,0,0,0.4))`,
              borderColor: `${soul.primary}60`,
              boxShadow: `0 0 40px ${soul.glow}, 0 0 80px ${soul.primary}20`,
            }}
          >
            🍄
          </div>
        </motion.div>

        <motion.h1
          className="text-xl font-semibold text-white tracking-wide mb-0.5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, ...springConfig }}
        >
          {user.name}
        </motion.h1>
        {user.address && (
          <p className="text-xs text-white/50 mb-1 font-mono">{shortId(user.address)}</p>
        )}
        <motion.span
          className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4"
          style={{
            backgroundColor: `${soul.primary}20`,
            color: soul.primary,
            border: `1px solid ${soul.primary}50`,
            boxShadow: `0 0 16px ${soul.glow}`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {user.soulType}
        </motion.span>

        {/* Bio 玻璃卡片 */}
        <motion.div
          className="w-full max-w-sm px-4 py-3 rounded-2xl border mb-3 text-center"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(255,255,255,0.08)',
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, ...springConfig }}
        >
          <p className="text-sm text-white/70 leading-relaxed">
            {user.bio || 'Tell us about yourself'}
          </p>
        </motion.div>
        {user.status && (
          <p className="text-xs text-white/50 mb-4">✨ {user.status}</p>
        )}

        {/* 标签：Onboarding 风格 chips */}
        {user.tags && user.tags.length > 0 && (
          <motion.div
            className="flex flex-wrap justify-center gap-2 mb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.26 }}
          >
            {user.tags.map((tag) => (
              <motion.span
                key={tag}
                className="px-3 py-1 rounded-full text-xs font-medium border"
                style={{
                  backgroundColor: `${soul.primary}12`,
                  color: soul.primary,
                  borderColor: `${soul.primary}40`,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={springConfig}
              >
                {tag}
              </motion.span>
            ))}
          </motion.div>
        )}

        {/* 主操作：弹性按钮 */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-3 mb-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, ...springConfig }}
        >
          {!user.isFriend && (
            <motion.button
              type="button"
              onClick={handleAddFriend}
              className="px-5 py-3 rounded-xl font-semibold text-sm border"
              style={{
                background: 'rgba(255,255,255,0.08)',
                borderColor: 'rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.9)',
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={springConfig}
            >
              Add friend
            </motion.button>
          )}
          <Link to={chatAddress ? `/chat/${chatAddress}` : '/chat'}>
            <motion.span
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
              style={{
                background: `linear-gradient(135deg, ${soul.primary}, hsl(258, 89%, 66%))`,
                color: '#0a0a12',
                boxShadow: `0 0 24px ${soul.glow}`,
              }}
              whileHover={{ scale: 1.03, boxShadow: `0 0 32px ${soul.glow}` }}
              whileTap={{ scale: 0.97 }}
              transition={springConfig}
            >
              <span aria-hidden>👋</span> Say hi!
            </motion.span>
          </Link>
          {user.isFriend && (
            <motion.button
              type="button"
              onClick={() => navigate('/map')}
              className="px-5 py-3 rounded-xl font-semibold text-sm border"
              style={{
                background: 'rgba(255,255,255,0.08)',
                borderColor: 'rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.9)',
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={springConfig}
            >
              📍 Location
            </motion.button>
          )}
        </motion.div>

        {/* 2x2 功能格：Lucide 图标，Friends / Activity 按当前蘑菇数据展示 */}
        <motion.div
          className="grid grid-cols-2 gap-3 w-full max-w-sm"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, ...springConfig }}
        >
          {[
            { key: 'friends', Icon: UsersRound, value: user.followers ?? 0, label: 'Friends' },
            { key: 'activity', Icon: null, value: user.activityCount ?? 0, label: user.activityLabel ?? 'Activity' },
            { key: 'achievements', Icon: Star, value: null, label: 'Achievements' },
            { key: 'checkin', Icon: MapPin, value: null, label: 'Check-in' },
          ].map(({ key, Icon, value, label }) => (
            <motion.button
              key={key}
              type="button"
              className="flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-2xl border min-h-[88px] text-white/90"
              style={{
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(12px)',
                borderColor: 'rgba(255,255,255,0.08)',
              }}
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.07)' }}
              whileTap={{ scale: 0.98 }}
              transition={springConfig}
            >
              {Icon ? (
                <Icon className="w-7 h-7 shrink-0" strokeWidth={2} />
              ) : (
                <span className="text-2xl font-semibold leading-none">{value}</span>
              )}
              {key === 'friends' && value != null && (
                <span className="text-sm font-semibold text-white">{value}</span>
              )}
              <span className="text-xs font-medium text-white/80 block text-center leading-tight">
                {label}
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* 底部弹窗：已成功向该好友发送申请 */}
      <AnimatePresence>
        {showAddFriendToast && (
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
            <p className="text-sm font-medium text-white">Friend request sent</p>
            <p className="text-xs text-white/60 mt-0.5">They can accept to become friends</p>
          </motion.div>
        )}
      </AnimatePresence>

      <NavBar />
    </motion.div>
  );
}
