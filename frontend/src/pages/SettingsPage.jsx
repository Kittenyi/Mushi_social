/**
 * 个人主页「我」— 参考 Soul 等 Web2 社交：封面 + 大头像 + 身份标签 + 设置收拢
 */
import { useState, useEffect, useRef } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { NavBar } from '../components/layout/NavBar';
import { fetchSoulByAddress } from '../lib/soulApi';
import { useProfileStore } from '../stores/useProfileStore';
import { clearOnboardingDone } from '../lib/onboarding';
import { useNavigate } from 'react-router-dom';

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
  { id: 'male', symbol: '♂', label: '男' },
  { id: 'female', symbol: '♀', label: '女' },
  { id: 'nonbinary', symbol: '⚲', label: '非二元' },
];

export function SettingsPage() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [soul, setSoul] = useState(null);
  const {
    displayName,
    gender,
    avatarUrl,
    email,
    ghostMode,
    setDisplayName,
    setGender,
    setAvatarUrl,
    setGhostMode,
  } = useProfileStore();
  const [editName, setEditName] = useState(displayName);
  const [showEdit, setShowEdit] = useState(false);
  const fileInputRef = useRef(null);

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
  const name = (displayName || '').trim() || '未设置昵称';
  const genderOption = GENDER_OPTIONS.find((o) => o.id === gender);

  return (
    <div
      className="min-h-screen text-white flex flex-col pb-20"
      style={{
        background: 'linear-gradient(180deg, #1a0f2e 0%, #0f0f1a 28%, #0f0f1a 100%)',
      }}
    >
      {/* 顶部封面区 — Soul 风格 */}
      <header className="relative">
        <div
          className="h-36 w-full rounded-b-3xl"
          style={{
            background: 'linear-gradient(135deg, #2e1a4e 0%, #1a1a2e 50%, #16213e 100%)',
            boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.06)',
          }}
        />
        {/* 大头像叠在封面下缘 */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-12 flex justify-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-[#0f0f1a] bg-white/10 shadow-xl ring-2 ring-white/10 transition-transform active:scale-95"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="头像" className="w-full h-full object-cover" />
            ) : (
              <span className="flex items-center justify-center w-full h-full text-5xl">🍄</span>
            )}
          </button>
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
        </div>
      </header>

      {/* 资料卡片区 */}
      <div className="flex-1 px-5 pt-16 pb-6">
        {/* 昵称 + 性别标签 + 编辑 */}
        <div className="text-center mb-5">
          <h1 className="text-2xl font-bold text-white mb-2">{name}</h1>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            {genderOption && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-white/10 text-white/90 border border-white/10">
                <span aria-hidden>{genderOption.symbol}</span>
                {genderOption.label}
              </span>
            )}
            <button
              type="button"
              onClick={() => setShowEdit((v) => !v)}
              className="text-violet-400 hover:text-violet-300 text-sm font-medium"
            >
              {showEdit ? '收起' : '编辑资料'}
            </button>
          </div>
          {email && (
            <p className="text-white/40 text-xs">已绑定邮箱</p>
          )}
        </div>

        {/* 编辑资料展开 */}
        {showEdit && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 mb-5 animate-fade-in-up">
            <p className="text-white/70 text-sm font-medium mb-3">姓名</p>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="你的名字"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-white/40 text-sm"
                maxLength={20}
              />
              <button
                type="button"
                onClick={() => setDisplayName(editName)}
                className="px-4 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium shrink-0"
              >
                保存
              </button>
            </div>
            <p className="text-white/70 text-sm font-medium mb-2">性别</p>
            <div className="flex gap-2 flex-wrap">
              {GENDER_OPTIONS.map(({ id, symbol, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setGender(id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    gender === id
                      ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/25'
                      : 'bg-white/10 hover:bg-white/15 text-white border border-white/5'
                  }`}
                >
                  <span className="opacity-90" aria-hidden>{symbol}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 灵魂标签 — Soul 风格 pill */}
        {(tags.length > 0 || isConnected) && (
          <section className="mb-6">
            <p className="text-white/60 text-xs font-medium mb-2 px-1">灵魂标签 · 链上画像</p>
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span
                    key={t.label}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium text-white bg-gradient-to-r ${TAG_COLORS[t.color] ?? TAG_COLORS.gray} shadow-lg`}
                  >
                    {t.label}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-white/40 text-sm">未获取到标签（请确认后端 /api/soul 已启动）</p>
            )}
          </section>
        )}

        {/* 设置区 — 收拢为列表 */}
        <section className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <p className="px-4 py-3 text-white/60 text-xs font-medium border-b border-white/10">设置</p>

          {/* 钱包 */}
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-white/80 font-medium text-sm mb-1">钱包</p>
            {isConnected && address ? (
              <>
                <p className="text-white/50 text-xs font-mono truncate mb-2">{address}</p>
                <button
                  type="button"
                  onClick={() => disconnect()}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  断开连接
                </button>
              </>
            ) : (
              <ConnectButton />
            )}
          </div>

          {/* 幽灵模式 */}
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-4">
            <div>
              <p className="text-white/80 font-medium text-sm">幽灵模式</p>
              <p className="text-white/45 text-xs mt-0.5">打开后地图上不显示你的位置</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={ghostMode}
              onClick={() => setGhostMode(!ghostMode)}
              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                ghostMode ? 'bg-violet-500' : 'bg-white/20'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-200 ${
                  ghostMode ? 'left-[calc(100%-1.25rem)]' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* 分享 */}
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-white/80 font-medium text-sm">分享</p>
            <p className="text-white/45 text-xs mt-0.5">分享 Profile、当前位置、生成分享卡片</p>
          </div>

          {/* 引导 */}
          <div className="px-4 py-3">
            <p className="text-white/80 font-medium text-sm mb-1">引导</p>
            <p className="text-white/45 text-xs mb-2">清除后下次打开会先进入欢迎/引导页</p>
            <button
              type="button"
              onClick={() => {
                clearOnboardingDone();
                navigate('/');
              }}
              className="text-violet-400 hover:text-violet-300 text-sm"
            >
              清除引导状态
            </button>
          </div>
        </section>
      </div>

      <NavBar />
    </div>
  );
}
