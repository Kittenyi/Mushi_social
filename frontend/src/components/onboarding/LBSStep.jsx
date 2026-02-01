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
        <h2 className="text-2xl font-semibold text-white mb-2">Enable location</h2>
        <p className="text-white/50 text-center text-sm max-w-xs mb-2">
          See friends nearby on the map — grab coffee and Sabai together.
        </p>
        <p className="text-white/40 text-center text-xs max-w-xs mb-10">
          We only use it to show “nearby” — you can turn it off anytime in Settings.
        </p>
        <button
          type="button"
          onClick={handleRequestLocation}
          className="btn-primary w-full max-w-sm mb-4"
        >
          {status === 'granted' ? 'Enabled — go to map…' : status === 'denied' ? 'Skipped — go to map…' : 'Enable location'}
        </button>
        <button
          type="button"
          onClick={() => {
            setStatus('skip');
            goToMap();
          }}
          className="text-white/40 text-sm hover:text-white/60 transition-colors"
        >
          Skip
        </button>
      </div>
    </OnboardingShell>
  );
}
