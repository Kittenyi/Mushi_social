/**
 * Onboarding 步骤 3: 生成 Soul 形象
 * 根据钱包地址生成灵魂类型（Degen/Collector/Builder/Explorer），蘑菇形象颜色随类型变化，Soul Card 弹跳入场
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { OnboardingShell } from './OnboardingShell';
import { fetchSoulByAddress } from '../../lib/soulApi';

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

/** Soul 类型 → 蘑菇预览渐变（Degen/Collector/Builder/Explorer） */
const SOUL_MUSHROOM_STYLE = {
  Degen: { gradient: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 50%, #c4b5fd 100%)', shadow: '0 8px 32px rgba(124,58,237,0.4)' },
  Collector: { gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #fcd34d 100%)', shadow: '0 8px 32px rgba(245,158,11,0.4)' },
  Builder: { gradient: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 50%, #7dd3fc 100%)', shadow: '0 8px 32px rgba(14,165,233,0.4)' },
  Explorer: { gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)', shadow: '0 8px 32px rgba(16,185,129,0.4)' },
  default: { gradient: 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)', shadow: '0 8px 24px rgba(0,0,0,0.3)' },
};

function getMushroomStyle(primaryLabel) {
  const key = primaryLabel && SOUL_MUSHROOM_STYLE[primaryLabel] ? primaryLabel : 'default';
  return SOUL_MUSHROOM_STYLE[key];
}

export function SoulStep() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const [soul, setSoul] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isConnected || !address) {
      setSoul(null);
      return;
    }
    let cancelled = false;
    let retryCount = 0;
    const MAX_RETRY = 2;
    setLoading(true);
    setError(null);
    const fetchSoul = () => {
      fetchSoulByAddress(address)
        .then((data) => {
          if (!cancelled) setSoul(data);
        })
        .catch(() => {
          if (!cancelled) {
            if (retryCount < MAX_RETRY) {
              retryCount += 1;
              setLoading(true);
              setTimeout(fetchSoul, 2000);
              return;
            }
            setError('拉取身份数据失败');
            setSoul(null);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };
    fetchSoul();
    return () => { cancelled = true; };
  }, [address, isConnected]);

  const tags = soul?.tags ?? [];
  const primaryTag = tags[0] ?? { label: 'Explorer', color: 'gray' };
  const mushroomStyle = getMushroomStyle(primaryTag.label);

  return (
    <OnboardingShell step={3}>
      <div className="flex-1 flex flex-col items-center px-6 pt-4 pb-8 animate-fade-in-up">
        <h2 className="text-2xl font-semibold text-white mb-1">你的灵魂类型</h2>
        <p className="text-white/50 text-sm mb-8">根据链上足迹与社交画像生成</p>

        {!isConnected && (
          <p className="text-white/50 text-sm mb-6">请先连接钱包</p>
        )}

        {isConnected && loading && (
          <div className="card-glass w-full max-w-sm p-8 mb-8 text-center text-white/60">
            正在分析链上与社交数据…
          </div>
        )}

        {isConnected && error && (
          <div className="card-glass w-full max-w-sm p-6 mb-8 text-red-400/90 text-sm">
            {error}（请确认后端已启动且 /api/soul 可用）
          </div>
        )}

        {isConnected && !loading && soul && (
          <div className="w-full max-w-sm mb-8 animate-bounce-in">
            <div className="card-glass p-6 mb-6 border-white/20">
              <div className="flex items-center gap-4">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shrink-0"
                  style={{
                    background: mushroomStyle.gradient,
                    boxShadow: mushroomStyle.shadow,
                  }}
                >
                  🍄
                </div>
                <div className="min-w-0">
                  <p className="text-white font-semibold text-lg">{primaryTag.label}</p>
                  <p className="text-white/60 text-sm">
                    {soul.raw && (
                      <>tx {soul.raw.txCount ?? 0} · 投票 {soul.raw.voteCount ?? 0} · 提案 {soul.raw.proposalCount ?? 0}</>
                    )}
                  </p>
                </div>
              </div>
            </div>
            {tags.length > 1 && (
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {tags.map((t) => (
                  <span
                    key={t.label}
                    className={`px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${TAG_COLORS[t.color] ?? TAG_COLORS.gray} bg-opacity-80`}
                  >
                    {t.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate('/onboarding/profile')}
          className="btn-primary"
        >
          继续
        </button>
      </div>
    </OnboardingShell>
  );
}
