/**
 * Onboarding 步骤 5: 开启 LBS
 * 请求定位权限、说明为何需要位置（显示附近好友）、用户可选择跳过
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingShell } from './OnboardingShell';
import { setOnboardingDone } from '../../lib/onboarding';

export function LBSStep() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null); // 'granted' | 'denied' | 'skip'

  const goToMap = () => {
    setOnboardingDone();
    navigate('/map');
  };

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setStatus('denied');
      setTimeout(goToMap, 800);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        setStatus('granted');
        setTimeout(goToMap, 600);
      },
      () => {
        setStatus('denied');
        setTimeout(goToMap, 800);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <OnboardingShell step={5}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 animate-fade-in-up">
        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl mb-6">
          📍
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">开启位置</h2>
        <p className="text-white/50 text-center text-sm max-w-xs mb-2">
          开启后可以在地图上看到附近的朋友，一起喝咖啡、一起 Sabai。
        </p>
        <p className="text-white/40 text-center text-xs max-w-xs mb-10">
          我们仅用于展示「附近的人」，可随时在设置中关闭。
        </p>
        <button
          type="button"
          onClick={handleRequestLocation}
          className="btn-primary w-full max-w-sm mb-4"
        >
          {status === 'granted' ? '已开启，进入地图…' : status === 'denied' ? '已跳过，进入地图…' : '开启定位'}
        </button>
        <button
          type="button"
          onClick={() => {
            setStatus('skip');
            goToMap();
          }}
          className="text-white/40 text-sm hover:text-white/60 transition-colors"
        >
          跳过
        </button>
      </div>
    </OnboardingShell>
  );
}
