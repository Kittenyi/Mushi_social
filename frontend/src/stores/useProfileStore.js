/**
 * 用户资料（名字、性别等）持久化到 localStorage
 * 连接钱包后仍保留，供地图/Profile/设置等使用
 */
import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'mushi_profile';

const defaultProfile = () => ({
  displayName: '',
  gender: '', // 'male' | 'female' | 'nonbinary' | ''
  avatarUrl: '', // 头像：本地 base64 或 URL
  email: '', // 邮箱注册（可选）
  ghostMode: false, // 幽灵模式：true = 地图上不显示我的位置
});

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProfile();
    const data = JSON.parse(raw);
    return { ...defaultProfile(), ...data };
  } catch {
    return defaultProfile();
  }
}

function save(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('[useProfileStore] save failed', e);
  }
}

/** 供 React 组件使用：读取并订阅变化（通过自定义事件） */
export function useProfileStore() {
  const [profile, setProfileState] = useState(load);

  const setProfile = useCallback((next) => {
    const nextProfile = typeof next === 'function' ? next(load()) : next;
    const merged = { ...defaultProfile(), ...load(), ...nextProfile };
    save(merged);
    setProfileState(merged);
  }, []);

  const setDisplayName = useCallback((name) => {
    setProfile((p) => ({ ...p, displayName: String(name ?? '').trim() }));
  }, [setProfile]);

  const setGender = useCallback((gender) => {
    setProfile((p) => ({ ...p, gender: gender ?? '' }));
  }, [setProfile]);

  const setAvatarUrl = useCallback((url) => {
    setProfile((p) => ({ ...p, avatarUrl: url ?? '' }));
  }, [setProfile]);

  const setEmail = useCallback((email) => {
    setProfile((p) => ({ ...p, email: String(email ?? '').trim() }));
  }, [setProfile]);

  const setGhostMode = useCallback((on) => {
    setProfile((p) => ({ ...p, ghostMode: Boolean(on) }));
  }, [setProfile]);

  // Rehydrate from localStorage on mount and when tab becomes visible (e.g. after wallet connect or refresh)
  useEffect(() => {
    setProfileState(load());
  }, []);

  useEffect(() => {
    const rehydrate = () => setProfileState(load());
    const onVisibility = () => { if (document.visibilityState === 'visible') rehydrate(); };
    window.addEventListener('storage', rehydrate);
    window.addEventListener('focus', rehydrate);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('storage', rehydrate);
      window.removeEventListener('focus', rehydrate);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return {
    displayName: profile.displayName,
    gender: profile.gender,
    avatarUrl: profile.avatarUrl,
    email: profile.email,
    ghostMode: profile.ghostMode,
    setProfile,
    setDisplayName,
    setGender,
    setAvatarUrl,
    setEmail,
    setGhostMode,
  };
}
