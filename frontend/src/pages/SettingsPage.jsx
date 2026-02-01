/**
 * 个人主页「我」— BLINK 风格：紫→金渐变、大头像、钱包标签、Bio CTA、2x2 可爱区 + 设置列表
 */
import { useState, useEffect, useRef } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { UsersRound, Activity, Star, MapPin } from 'lucide-react';
import { NavBar } from '../components/layout/NavBar';
import { fetchSoulByAddress } from '../lib/soulApi';
import { useProfileStore } from '../stores/useProfileStore';
import { clearOnboardingDone } from '../lib/onboarding';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const TAG_COLORS = {
  gold: 'from-amber-400 to-yellow-500',
  silver: 'from-slate-400 to-slate-500',
  emerald: 'from-emerald-500 to-teal-500',
  purple: 'from-violet-500 to-purple-600',
  blue: 'from-blue-500 to-cyan-500',
  cyan: 'from-cyan-400 to-blue-400',
  orange: 'from-orange-500 to-amber-500',
  green: 'from-green-500 to-emerald-500',
  gray: 'from-slate-500 to-slate-600',
};

const GENDER_OPTIONS = [
  { id: 'male', symbol: '♂', label: 'Male' },
  { id: 'female', symbol: '♀', label: 'Female' },
  { id: 'nonbinary', symbol: '⚲', label: 'Non-binary' },
];

function shortId(address) {
  if (!address || !address.startsWith('0x')) return '—';
  return `${address.slice(2, 6)}…${address.slice(-4)}`;
}

export function SettingsPage() {
  const navigate = useNavigate();
  const { nightMode, toggleNightMode } = useTheme();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [soul, setSoul] = useState(null);
  const {
    displayName,
    gender,
    avatarUrl,
    email,
    ghostMode,
    bio,
    setDisplayName,
    setGender,
    setAvatarUrl,
    setGhostMode,
    setBio,
  } = useProfileStore();
  const [editName, setEditName] = useState(displayName);
  const [showEdit, setShowEdit] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [editBio, setEditBio] = useState(bio);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setEditBio(bio);
  }, [bio]);

  useEffect(() => {
    setEditName(displayName);
  }, [displayName]);

  useEffect(() => {
    if (!isConnected || !address) {
      setSoul(null);
      return;
    }
    let cancelled = false;
    let retryId;
    const doFetch = () => {
      fetchSoulByAddress(address)
        .then((data) => {
          if (!cancelled) setSoul(data);
        })
        .catch(() => {
          if (cancelled) return;
          setSoul(null);
          retryId = setTimeout(doFetch, 2500);
        });
    };
    doFetch();
    return () => {
      cancelled = true;
      if (retryId) clearTimeout(retryId);
    };
  }, [address, isConnected]);

  const tags = soul?.tags ?? [];
  const name = (displayName || '').trim() || 'Set your name';
  const genderOption = GENDER_OPTIONS.find((o) => o.id === gender);

  return (
    <div className="flex min-h-screen flex-col bg-background profile-page pb-nav">
      {/* 顶部：标题、MUSHI pill、主题/编辑 */}
      <header className="flex items-center justify-between p-4 pt-safe">
        <div className="w-10" />
        <span className="profile-app-pill">MUSHI</span>
        <div className="flex items-center gap-2">
          <button type="button" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/15 flex items-center justify-center text-lg" title="Edit profile" onClick={() => setShowEdit((v) => !v)} aria-label="Edit profile">✏️</button>
        </div>
      </header>

      <div className="profile-hero flex-1 flex flex-col items-center px-6 pt-2 pb-6">
        {/* 头像：缩小比例，笔图标放在图像右下角 */}
        <div className="flex items-center justify-center mb-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-white/20 shadow-lg hover:ring-white/30 transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            title="修改头像"
            aria-label="修改头像"
          >
            <div className="w-full h-full overflow-hidden bg-white/5 flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">🍄</span>
              )}
            </div>
            <span
              className="absolute right-0 bottom-0 w-8 h-8 rounded-tl-lg flex items-center justify-center text-sm bg-black/50 text-white/90 hover:bg-black/60"
              aria-hidden
            >
              ✏️
            </span>
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => setAvatarUrl(reader.result);
            reader.readAsDataURL(file);
            e.target.value = '';
          }}
        />

        {/* 钱包标签 */}
        {isConnected && address && (
          <div className="profile-wallet-tag mb-2">
            <span className="opacity-80">🔗</span>
            <span className="font-mono text-sm">{shortId(address)}</span>
          </div>
        )}
        <h1 className="text-2xl font-bold text-white mb-1">{name}</h1>

        {/* 性别 + Soul 标签 */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
          {genderOption && (
            <span className="profile-soul-pill inline-flex items-center gap-1.5">
              <span aria-hidden>{genderOption.symbol}</span>
              {genderOption.label}
            </span>
          )}
          {tags.slice(0, 3).map((t) => (
            <span
              key={t.label}
              className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${TAG_COLORS[t.color] ?? TAG_COLORS.gray} shadow-md`}
            >
              {t.label}
            </span>
          ))}
        </div>
        {email && <p className="text-white/40 text-xs mb-2">Email linked</p>}

        {/* Bio: click to edit, save to profile */}
        {editingBio ? (
          <div className="w-full max-w-sm mt-2 mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              placeholder="Tell us about yourself"
              className="w-full min-h-[80px] bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-white/40 text-sm resize-y focus:outline-none focus:border-white/20"
              maxLength={200}
              autoFocus
            />
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={() => { setBio(editBio); setEditingBio(false); }}
                className="px-4 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => { setEditBio(bio); setEditingBio(false); }}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditingBio(true)}
            className="profile-bio-cta w-full max-w-sm mt-2 mb-4 text-left px-4 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 transition-colors"
          >
            <span className="opacity-70 mr-2">✏️</span>
            <span className={bio ? 'text-white/80' : 'text-white/50'}>
              {bio || 'Tell us about yourself'}
            </span>
          </button>
        )}

        {/* 编辑资料展开 */}
        {showEdit && (
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-4 mb-4">
            <p className="text-white/70 text-sm font-medium mb-2">Display name</p>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your name"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-white/40 text-sm"
                maxLength={20}
              />
              <button
                type="button"
                onClick={() => setDisplayName(editName)}
                className="px-4 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium shrink-0"
              >
                Save
              </button>
            </div>
            <p className="text-white/70 text-sm font-medium mb-2">Gender</p>
            <div className="flex gap-2 flex-wrap">
              {GENDER_OPTIONS.map(({ id, symbol, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setGender(id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    gender === id ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/25' : 'bg-white/10 hover:bg-white/15 text-white border border-white/5'
                  }`}
                >
                  <span className="opacity-90" aria-hidden>{symbol}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 2x2 功能区：Lucide 图标 */}
        <div className="profile-grid w-full max-w-sm grid grid-cols-2 gap-4 mb-6">
          <button type="button" className="profile-grid-item flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 transition-colors text-white/90">
            <UsersRound className="w-7 h-7 shrink-0" strokeWidth={2} />
            <span className="text-sm font-medium">Friends</span>
          </button>
          <button type="button" className="profile-grid-item flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 transition-colors text-white/90">
            <span className="text-2xl font-semibold">0</span>
            <span className="text-sm font-medium">Activity</span>
          </button>
          <button type="button" className="profile-grid-item flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 transition-colors text-white/90">
            <Star className="w-7 h-7 shrink-0" strokeWidth={2} />
            <span className="text-sm font-medium">Achievements</span>
          </button>
          <button type="button" className="profile-grid-item flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 transition-colors text-white/90">
            <MapPin className="w-7 h-7 shrink-0" strokeWidth={2} />
            <span className="text-sm font-medium">Check-in</span>
          </button>
        </div>

        {/* 设置卡片：钱包 / 幽灵模式 / 分享 / 引导 */}
        <section className="w-full max-w-sm profile-status-card overflow-hidden mb-4">
          <p className="px-4 py-3 text-white/60 text-xs font-medium border-b border-white/10">Settings</p>

          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-4">
            <div>
              <p className="text-white/80 font-medium text-sm">Night mode</p>
              <p className="text-white/45 text-xs mt-0.5">Dark map and UI</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={nightMode}
              onClick={toggleNightMode}
              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${nightMode ? 'bg-violet-500' : 'bg-white/20'}`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-200 ${nightMode ? 'left-[calc(100%-1.25rem)]' : 'left-1'}`}
              />
            </button>
          </div>

          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-white/80 font-medium text-sm mb-1">Wallet</p>
            {isConnected && address ? (
              <>
                <p className="text-white/50 text-xs font-mono truncate mb-2">{address}</p>
                <button type="button" onClick={() => disconnect()} className="text-red-400 hover:text-red-300 text-sm">
                  Disconnect
                </button>
              </>
            ) : (
              <ConnectButton />
            )}
          </div>

          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-4">
            <div>
              <p className="text-white/80 font-medium text-sm">Ghost mode</p>
              <p className="text-white/45 text-xs mt-0.5">Hide your location on the map</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={ghostMode}
              onClick={() => setGhostMode(!ghostMode)}
              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${ghostMode ? 'bg-violet-500' : 'bg-white/20'}`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-200 ${ghostMode ? 'left-[calc(100%-1.25rem)]' : 'left-1'}`}
              />
            </button>
          </div>

          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-white/80 font-medium text-sm">Share</p>
            <p className="text-white/45 text-xs mt-0.5">Share profile and location</p>
          </div>

          <div className="px-4 py-3">
            <p className="text-white/80 font-medium text-sm mb-1">Onboarding</p>
            <p className="text-white/45 text-xs mb-2">Clear to see welcome screen again next time</p>
            <button
              type="button"
              onClick={() => {
                clearOnboardingDone();
                navigate('/');
              }}
              className="text-violet-400 hover:text-violet-300 text-sm"
            >
              Clear onboarding
            </button>
          </div>
        </section>

        {isConnected && tags.length === 0 && (
          <p className="text-white/40 text-xs text-center max-w-sm mb-2">
            Soul tags require backend. Use settings above until then.
          </p>
        )}
      </div>

      <NavBar />
    </div>
  );
}
