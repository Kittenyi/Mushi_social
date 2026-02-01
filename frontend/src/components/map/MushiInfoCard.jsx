/**
 * Mushroom info card: bottom sheet on map click.
 * Mini-card: identity + actions (Add Friend, Message, Go to their location).
 * Click expand / "View full profile" → rises to full profile view (same as ProfilePage).
 * "Go to their location" = flyTo + open Google/Apple Maps with directions.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserRoundPlus,
  MessageSquare,
  MapPin,
  X,
  ChevronUp,
  UsersRound,
  Star,
} from 'lucide-react';
import { MOCK_USERS, SOUL_COLORS as PROFILE_SOUL, defaultSoul, shortId, handleFromName } from '@/lib/profileData';

const SOUL_COLORS = {
  degen: '#9945FF',
  whale: '#FFD700',
  builder: '#00D4FF',
  artist: '#FF6B9D',
  explorer: '#A3FF12',
  default: '#A3FF12',
};

function soulLabel(soulType) {
  if (!soulType) return 'Explorer';
  return String(soulType).charAt(0).toUpperCase() + String(soulType).slice(1);
}

const springConfig = { stiffness: 300, damping: 22 };

export function MushiInfoCard({
  profile,
  position,
  myPosition,
  mapInstance,
  onClose,
  onAddFriend,
  onMessage,
}) {
  const [expanded, setExpanded] = useState(false);
  const [fullView, setFullView] = useState(false);
  const [showExternalMaps, setShowExternalMaps] = useState(false);

  if (!profile) return null;

  const isFriend = profile.isFriend === true;
  const soulColor = SOUL_COLORS[profile.soulType] || SOUL_COLORS.default;
  const lat = position?.[1];
  const lng = position?.[0];
  const user = MOCK_USERS[profile.id]
    ? { ...MOCK_USERS[profile.id], name: MOCK_USERS[profile.id].name || profile.nickname }
    : {
        name: profile.nickname,
        address: null,
        bio: '',
        soulType: profile.soulType,
        status: '',
        isFriend,
        tags: profile.interests || [],
        following: 0,
        followers: 0,
        activityCount: 0,
        activityLabel: 'Activity',
      };
  const soulKey = user.soulType && (user.soulType[0].toUpperCase() + user.soulType.slice(1));
  const soul = PROFILE_SOUL[soulKey] || defaultSoul;

  const handleExpand = () => {
    setExpanded((e) => !e);
    if (!expanded) setFullView(true);
  };

  const handleGoToLocation = () => {
    if (mapInstance && position?.length === 2) {
      mapInstance.flyTo({ center: position, zoom: 15, duration: 1500 });
      setShowExternalMaps(true);
    }
  };

  const hasMyPosition = Array.isArray(myPosition) && myPosition.length === 2;
  const myLat = hasMyPosition ? myPosition[1] : null;
  const myLng = hasMyPosition ? myPosition[0] : null;

  const openGoogleMaps = () => {
    if (lat == null || lng == null) return;
    const url = hasMyPosition && myLat != null && myLng != null
      ? `https://www.google.com/maps/dir/?api=1&origin=${myLat},${myLng}&destination=${lat},${lng}`
      : `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openAppleMaps = () => {
    if (lat == null || lng == null) return;
    const url = hasMyPosition && myLat != null && myLng != null
      ? `https://maps.apple.com/?saddr=${myLat},${myLng}&daddr=${lat},${lng}`
      : `https://maps.apple.com/?q=${lat},${lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const cardHeight = fullView || expanded ? '88vh' : '58vh';

  return (
    <motion.div
      className="fixed inset-0 z-30 flex flex-col justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className="absolute inset-0 bg-black/40 pointer-events-auto"
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        className="relative pointer-events-auto flex flex-col rounded-t-3xl overflow-y-auto overscroll-contain"
        style={{
          maxHeight: cardHeight,
          background: 'linear-gradient(180deg, rgba(20, 20, 35, 0.98) 0%, rgba(15, 15, 26, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
        }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
      >
        <div className="flex-shrink-0 flex items-center justify-center py-2">
          <button
            type="button"
            onClick={handleExpand}
            className="p-2 rounded-full text-white/50 hover:text-white/80 hover:bg-white/5"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            <ChevronUp className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {fullView && expanded ? (
          /* Full profile view (rise up like ProfilePage) */
          <div className="flex-1 px-5 pb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-white/90">{handleFromName(user.name)}</span>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white/70 hover:bg-white/10"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <motion.div
              className="flex items-center gap-6 px-6 py-3 rounded-full border mb-4"
              style={{
                background: 'rgba(255,255,255,0.05)',
                borderColor: `${soul.primary}30`,
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springConfig}
            >
              <span className="text-sm text-white/80">
                <strong className="text-white font-semibold">{user.following ?? 0}</strong> Following
              </span>
              <span className="text-sm text-white/80">
                <strong className="text-white font-semibold">{user.followers ?? 0}</strong> Friends
              </span>
            </motion.div>
            <motion.div
              className="w-24 h-24 rounded-full flex items-center justify-center text-4xl border-2 mx-auto mb-3"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${soul.primary}40, rgba(0,0,0,0.4))`,
                borderColor: `${soul.primary}60`,
                boxShadow: `0 0 40px ${soul.glow}`,
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={springConfig}
            >
              🍄
            </motion.div>
            <motion.h1 className="text-xl font-semibold text-white text-center mb-0.5" transition={springConfig}>
              {user.name}
            </motion.h1>
            {user.address && (
              <p className="text-xs text-white/50 text-center mb-1 font-mono">{shortId(user.address)}</p>
            )}
            <motion.span
              className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4 mx-auto block w-fit"
              style={{
                backgroundColor: `${soul.primary}20`,
                color: soul.primary,
                border: `1px solid ${soul.primary}50`,
              }}
            >
              {user.soulType}
            </motion.span>
            {user.bio && (
              <p className="text-sm text-white/70 text-center mb-3 px-2">{user.bio}</p>
            )}
            {user.status && (
              <p className="text-xs text-white/50 text-center mb-4">✨ {user.status}</p>
            )}
            {user.tags?.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-5">
                {user.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-medium border"
                    style={{
                      backgroundColor: `${soul.primary}12`,
                      color: soul.primary,
                      borderColor: `${soul.primary}40`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
              {!user.isFriend && (
                <motion.button
                  type="button"
                  onClick={() => { onAddFriend?.(profile); onClose?.(); }}
                  className="px-5 py-3 rounded-xl font-semibold text-sm border border-white/15 bg-white/10 text-white"
                  whileTap={{ scale: 0.97 }}
                  transition={springConfig}
                >
                  Add friend
                </motion.button>
              )}
              <motion.button
                type="button"
                onClick={() => { onMessage?.(profile); onClose?.(); }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-[#0a0a12]"
                style={{
                  background: `linear-gradient(135deg, ${soul.primary}, hsl(258, 89%, 66%))`,
                  boxShadow: `0 0 24px ${soul.glow}`,
                }}
                whileTap={{ scale: 0.97 }}
                transition={springConfig}
              >
                <span aria-hidden>👋</span> Say hi!
              </motion.button>
              {position?.length === 2 && (
                <motion.button
                  type="button"
                  onClick={handleGoToLocation}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm border border-white/20 bg-white/10 text-white"
                  whileTap={{ scale: 0.97 }}
                  transition={springConfig}
                >
                  <MapPin className="w-4 h-4" strokeWidth={2.25} /> Location
                </motion.button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              {[
                { key: 'friends', Icon: UsersRound, value: user.followers ?? 0, label: 'Friends' },
                { key: 'activity', Icon: null, value: user.activityCount ?? 0, label: user.activityLabel ?? 'Activity' },
                { key: 'achievements', Icon: Star, value: null, label: 'Achievements' },
                { key: 'checkin', Icon: MapPin, value: null, label: 'Check-in' },
              ].map(({ key, Icon, value, label }) => (
                <div
                  key={key}
                  className="flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-2xl border min-h-[88px] text-white/90"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    borderColor: 'rgba(255,255,255,0.08)',
                  }}
                >
                  {Icon ? <Icon className="w-7 h-7 shrink-0" strokeWidth={2} /> : <span className="text-2xl font-semibold">{value}</span>}
                  {key === 'friends' && value != null && <span className="text-sm font-semibold text-white">{value}</span>}
                  <span className="text-xs font-medium text-white/80 text-center leading-tight">{label}</span>
                </div>
              ))}
            </div>
            {showExternalMaps && lat != null && lng != null && (
              <div className="mt-5 pt-4 border-t border-white/10">
                <p className="text-xs text-white/50 mb-2 text-center">Open in external map (with route)</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={openGoogleMaps}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/15 text-white border border-white/10"
                  >
                    Google Maps
                  </button>
                  <button
                    type="button"
                    onClick={openAppleMaps}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/15 text-white border border-white/10"
                  >
                    Apple Maps
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Mini-card */
          <>
            <div className="flex-shrink-0 flex items-start justify-between gap-3 px-5 pb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 border-2"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${soulColor}40, rgba(0,0,0,0.3))`,
                    borderColor: `${soulColor}50`,
                  }}
                >
                  🍄
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-white truncate">{profile.nickname}</h2>
                  <p className="text-[10px] uppercase tracking-wider text-white/45 mt-1.5 mb-0.5">Identity</p>
                  <span
                    className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
                    style={{
                      backgroundColor: `${soulColor}22`,
                      color: soulColor,
                      border: `1px solid ${soulColor}50`,
                      boxShadow: `0 0 12px ${soulColor}25`,
                    }}
                  >
                    {soulLabel(profile.soulType)}
                  </span>
                  {profile.walletLabel && (
                    <p className="text-xs text-white/45 mt-2 font-mono truncate">{profile.walletLabel}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white/70 hover:bg-white/10 shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {expanded && profile.interests?.length > 0 && (
              <div className="px-5 pb-3 flex flex-wrap gap-2">
                {profile.interests.slice(0, 5).map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium text-white/70 border border-white/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex-shrink-0 px-5 pb-3 pt-1 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => { setFullView(true); setExpanded(true); }}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white/80 border border-white/15 bg-white/5 hover:bg-white/10"
              >
                View full profile
              </button>
              {!isFriend && (
                <button
                  type="button"
                  onClick={() => { onAddFriend?.(profile); onClose?.(); }}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform active:scale-95"
                  style={{
                    background: `linear-gradient(135deg, ${soulColor}30, ${soulColor}15)`,
                    border: `1px solid ${soulColor}50`,
                    color: soulColor,
                    boxShadow: `0 4px 16px ${soulColor}20`,
                  }}
                  title="Add Friend"
                  aria-label="Add Friend"
                >
                  <UserRoundPlus className="w-6 h-6" strokeWidth={2.25} />
                </button>
              )}
              <button
                type="button"
                onClick={() => { onMessage?.(profile); onClose?.(); }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.35), rgba(139, 92, 246, 0.15))',
                  border: '1px solid rgba(139, 92, 246, 0.5)',
                  color: '#A78BFA',
                  boxShadow: '0 4px 16px rgba(139, 92, 246, 0.2)',
                }}
                title="Message"
                aria-label="Message"
              >
                <MessageSquare className="w-6 h-6" strokeWidth={2.25} />
              </button>
              {position?.length === 2 && (
                <button
                  type="button"
                  onClick={handleGoToLocation}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/20 bg-white/10 hover:bg-white/15 text-white transition-transform active:scale-95"
                  title="Go to their location"
                  aria-label="Go to their location"
                >
                  <MapPin className="w-6 h-6" strokeWidth={2.25} />
                </button>
              )}
            </div>

            {showExternalMaps && lat != null && lng != null && (
              <div className="flex-shrink-0 px-5 pb-5 pt-2 border-t border-white/10">
                <p className="text-xs text-white/50 mb-2">Open in external map {hasMyPosition ? '(with route)' : ''}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={openGoogleMaps}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/15 text-white border border-white/10"
                  >
                    Google Maps
                  </button>
                  <button
                    type="button"
                    onClick={openAppleMaps}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/15 text-white border border-white/10"
                  >
                    Apple Maps
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
