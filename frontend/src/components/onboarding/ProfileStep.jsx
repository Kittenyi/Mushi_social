/**
 * Onboarding 步骤 4: 设置个人资料
 * 输入昵称（Name）+ 选择头像：默认蘑菇或上传自定义图片
 */
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingShell } from './OnboardingShell';
import { useProfileStore } from '../../stores/useProfileStore';

export function ProfileStep() {
  const navigate = useNavigate();
  const { displayName, avatarUrl, setDisplayName, setAvatarUrl } = useProfileStore();
  const [nickname, setNickname] = useState(() => displayName || '');
  const fileInputRef = useRef(null);

  const handleContinue = () => {
    setDisplayName(nickname);
    navigate('/onboarding/lbs');
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(reader.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <OnboardingShell step={4}>
      <div className="flex-1 flex flex-col items-center px-6 pt-4 pb-8 animate-fade-in-up">
        <h2 className="text-2xl font-semibold text-white mb-1">Set up your profile</h2>
        <p className="text-white/50 text-sm mb-8">So friends can recognize you</p>

        <div className="w-full max-w-sm space-y-6 mb-8">
          <div>
            <p className="text-white/70 text-sm mb-2">Avatar</p>
            <button
              type="button"
              onClick={handleAvatarClick}
              className="w-24 h-24 rounded-2xl border-2 border-dashed border-white/20 bg-white/5 overflow-hidden flex items-center justify-center shrink-0 hover:border-white/30 hover:bg-white/[0.08] transition-all"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl text-white/60">🍄</span>
              )}
            </button>
            <p className="text-white/40 text-xs mt-1">Default mushroom · tap to upload your own</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div>
            <p className="text-white/70 text-sm mb-2">Nickname</p>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Your name"
              className="input-zenly w-full text-center text-lg"
              maxLength={20}
              autoFocus
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleContinue}
          className="btn-primary"
        >
          Continue
        </button>
      </div>
    </OnboardingShell>
  );
}
