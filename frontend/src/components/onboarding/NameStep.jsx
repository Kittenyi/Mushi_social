/**
 * 身份设定 - 名字输入，保存到 localStorage，连接钱包后仍保留
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingShell } from './OnboardingShell';
import { useProfileStore } from '../../stores/useProfileStore';

export function NameStep() {
  const navigate = useNavigate();
  const { displayName, setDisplayName } = useProfileStore();
  const [value, setValue] = useState(displayName || '');

  const handleContinue = () => {
    setDisplayName(value);
    navigate('/onboarding/gender');
  };

  return (
    <OnboardingShell step={3}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-4 pb-8 animate-fade-in-up">
        <h2 className="text-2xl font-semibold text-white mb-1">你的名字</h2>
        <p className="text-white/50 text-sm mb-8">让朋友更容易认出你</p>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="你的名字"
          className="input-zenly max-w-sm w-full mb-8 text-center text-lg"
          maxLength={20}
          autoFocus
        />
        <button
          type="button"
          onClick={handleContinue}
          className="btn-primary"
        >
          继续
        </button>
      </div>
    </OnboardingShell>
  );
}
