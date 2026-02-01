/**
 * 身份设定 - 性别选择，保存到 localStorage，连接钱包后仍保留
 */
import { useNavigate } from 'react-router-dom';
import { OnboardingShell } from './OnboardingShell';
import { useProfileStore } from '../../stores/useProfileStore';

const OPTIONS = [
  { id: 'male', symbol: '♂', label: '男' },
  { id: 'female', symbol: '♀', label: '女' },
  { id: 'nonbinary', symbol: '⚲', label: '非二元' },
];

export function GenderStep() {
  const navigate = useNavigate();
  const { gender, setGender } = useProfileStore();

  const handleSelect = (id) => {
    setGender(id);
    navigate('/onboarding/profile');
  };

  return (
    <OnboardingShell step={3}>
      <div className="flex-1 flex flex-col items-center px-6 pt-4 pb-8 animate-fade-in-up">
        <h2 className="text-2xl font-semibold text-white mb-1">选择性别</h2>
        <p className="text-white/50 text-sm mb-8">可选，用于展示</p>
        <div className="flex flex-col gap-3 w-full max-w-sm mb-8">
          {OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => handleSelect(o.id)}
              className={`card-glass w-full py-4 text-lg font-medium rounded-2xl transition-all inline-flex items-center justify-center gap-3 ${
                gender === o.id ? 'ring-2 ring-white/40 bg-white/10' : 'hover:bg-white/[0.08]'
              }`}
            >
              <span className="text-xl opacity-90" aria-hidden>{o.symbol}</span>
              {o.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => navigate('/onboarding/profile')}
          className="text-white/50 text-sm"
        >
          跳过
        </button>
      </div>
    </OnboardingShell>
  );
}
